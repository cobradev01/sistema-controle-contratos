const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function generatePONumber() {
  const date = new Date();
  return `OC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
}

router.get('/', async (req, res) => {
  try {
    const { status, obraId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const where = { companyId: req.companyId };
    if (status) where.status = status;
    if (obraId) where.obraId = obraId;

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where, skip: Number(skip), take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { obra: { select: { name: true } } },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.purchaseOrder.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
      include: { obra: true, uploads: true },
    });
    if (!order) return res.status(404).json({ error: 'Ordem de compra não encontrada' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { obraId, payerCnpj, payerName, supplierName, supplierCnpj, items, notes } = req.body;

    const obra = await prisma.obra.findFirst({ where: { id: obraId, companyId: req.companyId } });
    if (!obra) return res.status(404).json({ error: 'Obra não encontrada' });

    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const order = await prisma.purchaseOrder.create({
      data: {
        companyId: req.companyId,
        obraId, payerCnpj, payerName, supplierName, supplierCnpj,
        items, notes,
        totalValue,
        number: generatePONumber(),
        status: 'DRAFT',
      },
      include: { obra: true },
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const data = { status };
    if (status === 'APPROVED') data.approvedAt = new Date();
    if (status === 'SENT') data.issuedAt = new Date();

    const order = await prisma.purchaseOrder.update({ where: { id: req.params.id }, data });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
