const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/contracts', async (req, res) => {
  try {
    const { startDate, endDate, status, type } = req.query;
    const where = { companyId: req.companyId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const contracts = await prisma.contract.findMany({
      where,
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      total: contracts.length,
      totalValue: contracts.reduce((sum, c) => sum + Number(c.value || 0), 0),
      byStatus: contracts.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {}),
      byType: contracts.reduce((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {}),
    };

    res.json({ contracts, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/obras', async (req, res) => {
  try {
    const { status } = req.query;
    const where = { companyId: req.companyId };
    if (status) where.status = status;

    const obras = await prisma.obra.findMany({
      where,
      include: { custos: true, _count: { select: { purchaseOrders: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      total: obras.length,
      totalBudget: obras.reduce((sum, o) => sum + Number(o.budget), 0),
      totalCost: obras.reduce((sum, o) => sum + Number(o.totalCost), 0),
      byStatus: obras.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {}),
    };

    res.json({ obras, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/financial', async (req, res) => {
  try {
    const [contractsValue, obrasBudget, obrasCost, purchaseOrdersValue] = await Promise.all([
      prisma.contract.aggregate({ where: { companyId: req.companyId, status: 'ACTIVE' }, _sum: { value: true } }),
      prisma.obra.aggregate({ where: { companyId: req.companyId }, _sum: { budget: true } }),
      prisma.obra.aggregate({ where: { companyId: req.companyId }, _sum: { totalCost: true } }),
      prisma.purchaseOrder.aggregate({ where: { companyId: req.companyId, status: { in: ['APPROVED', 'SENT', 'COMPLETED'] } }, _sum: { totalValue: true } }),
    ]);

    res.json({
      activeContractsValue: Number(contractsValue._sum.value || 0),
      totalObrasBudget: Number(obrasBudget._sum.budget || 0),
      totalObrasCost: Number(obrasCost._sum.totalCost || 0),
      totalPurchaseOrders: Number(purchaseOrdersValue._sum.totalValue || 0),
      budgetVariance: Number(obrasBudget._sum.budget || 0) - Number(obrasCost._sum.totalCost || 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
