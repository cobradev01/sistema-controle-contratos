const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const where = { companyId: req.companyId };
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [obras, total] = await Promise.all([
      prisma.obra.findMany({
        where, skip: Number(skip), take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contract: { select: { title: true } },
          _count: { select: { steps: true, custos: true, purchaseOrders: true } },
        },
      }),
      prisma.obra.count({ where }),
    ]);

    const enriched = obras.map(o => ({
      ...o,
      budgetUsed: Number(o.totalCost),
      budgetPercent: o.budget > 0 ? Math.round((Number(o.totalCost) / Number(o.budget)) * 100) : 0,
    }));

    res.json({ obras: enriched, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const obra = await prisma.obra.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
      include: {
        contract: true,
        steps: { orderBy: { order: 'asc' } },
        vistorias: { include: { uploads: true }, orderBy: { date: 'desc' } },
        custos: { orderBy: { date: 'desc' } },
        purchaseOrders: { orderBy: { createdAt: 'desc' } },
        uploads: true,
      },
    });
    if (!obra) return res.status(404).json({ error: 'Obra não encontrada' });
    res.json(obra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, address, budget, startDate, endDate, contractId, responsible } = req.body;

    const defaultSteps = [
      { name: 'Vistoria Inicial', phase: 'PLANNING', order: 1 },
      { name: 'Aprovação de Projeto', phase: 'PLANNING', order: 2 },
      { name: 'Mobilização', phase: 'PLANNING', order: 3 },
      { name: 'Fundação e Estrutura', phase: 'EXECUTION', order: 4 },
      { name: 'Alvenaria e Cobertura', phase: 'EXECUTION', order: 5 },
      { name: 'Instalações Elétricas', phase: 'EXECUTION', order: 6 },
      { name: 'Instalações Hidráulicas', phase: 'EXECUTION', order: 7 },
      { name: 'Acabamento', phase: 'EXECUTION', order: 8 },
      { name: 'Vistoria Final', phase: 'DELIVERY', order: 9 },
      { name: 'Entrega de Chaves', phase: 'DELIVERY', order: 10 },
    ];

    const obra = await prisma.obra.create({
      data: {
        companyId: req.companyId,
        contractId: contractId || null,
        name, description, address, responsible,
        budget: parseFloat(budget),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        steps: { create: defaultSteps },
      },
      include: { steps: true },
    });

    res.status(201).json(obra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, address, budget, startDate, endDate, status, responsible } = req.body;
    const obra = await prisma.obra.update({
      where: { id: req.params.id },
      data: {
        name, description, address, responsible, status,
        budget: budget ? parseFloat(budget) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    res.json(obra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Steps
router.put('/:id/steps/:stepId', async (req, res) => {
  try {
    const step = await prisma.obraStep.update({
      where: { id: req.params.stepId },
      data: { ...req.body, completedAt: req.body.status === 'COMPLETED' ? new Date() : undefined },
    });
    res.json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vistorias
router.post('/:id/vistorias', async (req, res) => {
  try {
    const vistoria = await prisma.obraVistoria.create({
      data: { obraId: req.params.id, ...req.body, date: new Date(req.body.date) },
    });
    res.status(201).json(vistoria);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Custos
router.post('/:id/custos', async (req, res) => {
  try {
    const custo = await prisma.obraCusto.create({
      data: { obraId: req.params.id, ...req.body, value: parseFloat(req.body.value), date: new Date(req.body.date) },
    });

    // Atualiza total de custos da obra
    const total = await prisma.obraCusto.aggregate({ where: { obraId: req.params.id }, _sum: { value: true } });
    await prisma.obra.update({ where: { id: req.params.id }, data: { totalCost: total._sum.value || 0 } });

    res.status(201).json(custo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/custos/:custoId', async (req, res) => {
  try {
    await prisma.obraCusto.delete({ where: { id: req.params.custoId } });
    const total = await prisma.obraCusto.aggregate({ where: { obraId: req.params.id }, _sum: { value: true } });
    await prisma.obra.update({ where: { id: req.params.id }, data: { totalCost: total._sum.value || 0 } });
    res.json({ message: 'Custo removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
