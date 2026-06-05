const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = { companyId: req.companyId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { relatedParty: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true } }, template: { select: { name: true } } },
      }),
      prisma.contract.count({ where }),
    ]);

    // Calcula vigência restante
    const enriched = contracts.map(c => ({
      ...c,
      daysRemaining: c.endDate ? Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
    }));

    res.json({ contracts: enriched, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
      include: {
        createdBy: { select: { name: true, email: true } },
        template: true,
        signatureRequests: true,
        obras: { select: { id: true, name: true, status: true } },
        uploads: true,
      },
    });
    if (!contract) return res.status(404).json({ error: 'Contrato não encontrado' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, type, content, templateId, relatedParty, relatedDoc, value, startDate, endDate, fieldValues, notes } = req.body;

    const contract = await prisma.contract.create({
      data: {
        companyId: req.companyId,
        createdById: req.user.id,
        title, type, content, templateId, relatedParty, relatedDoc,
        value: value ? parseFloat(value) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        fieldValues, notes,
        status: 'DRAFT',
      },
    });

    await prisma.auditLog.create({
      data: { companyId: req.companyId, userId: req.user.id, entityType: 'contract', entityId: contract.id, action: 'CREATE', newValues: contract },
    });

    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.contract.findFirst({ where: { id: req.params.id, companyId: req.companyId } });
    if (!existing) return res.status(404).json({ error: 'Contrato não encontrado' });

    const { title, type, content, relatedParty, relatedDoc, value, startDate, endDate, fieldValues, notes, status } = req.body;

    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: {
        title, type, content, relatedParty, relatedDoc,
        value: value ? parseFloat(value) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        fieldValues, notes, status,
      },
    });

    await prisma.auditLog.create({
      data: { companyId: req.companyId, userId: req.user.id, entityType: 'contract', entityId: contract.id, action: 'UPDATE', oldValues: existing, newValues: contract },
    });

    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const contract = await prisma.contract.findFirst({ where: { id: req.params.id, companyId: req.companyId } });
    if (!contract) return res.status(404).json({ error: 'Contrato não encontrado' });

    await prisma.contract.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    res.json({ message: 'Contrato cancelado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
