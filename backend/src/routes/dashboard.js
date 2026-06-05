const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [
      totalContracts,
      activeContracts,
      pendingSignatures,
      expiringContracts,
      totalObras,
      activeObras,
      totalBudget,
      totalCost,
      pendingPOs,
      recentContracts,
      recentObras,
      contractsByType,
      obrasByStatus,
    ] = await Promise.all([
      prisma.contract.count({ where: { companyId } }),
      prisma.contract.count({ where: { companyId, status: 'ACTIVE' } }),
      prisma.contract.count({ where: { companyId, status: 'PENDING_SIGNATURE' } }),
      prisma.contract.count({ where: { companyId, status: 'ACTIVE', endDate: { lte: thirtyDaysFromNow, gte: now } } }),
      prisma.obra.count({ where: { companyId } }),
      prisma.obra.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      prisma.obra.aggregate({ where: { companyId }, _sum: { budget: true } }),
      prisma.obra.aggregate({ where: { companyId }, _sum: { totalCost: true } }),
      prisma.purchaseOrder.count({ where: { companyId, status: 'PENDING_APPROVAL' } }),
      prisma.contract.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, status: true, relatedParty: true, createdAt: true } }),
      prisma.obra.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, status: true, budget: true, totalCost: true } }),
      prisma.contract.groupBy({ by: ['type'], where: { companyId }, _count: true }),
      prisma.obra.groupBy({ by: ['status'], where: { companyId }, _count: true }),
    ]);

    res.json({
      contracts: { total: totalContracts, active: activeContracts, pendingSignature: pendingSignatures, expiring: expiringContracts },
      obras: { total: totalObras, active: activeObras, totalBudget: Number(totalBudget._sum.budget || 0), totalCost: Number(totalCost._sum.totalCost || 0) },
      purchaseOrders: { pending: pendingPOs },
      recentContracts,
      recentObras,
      charts: { contractsByType, obrasByStatus },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
