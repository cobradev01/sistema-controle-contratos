const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const templates = await prisma.contractTemplate.findMany({
      where: { companyId: req.companyId, active: true },
      include: { fields: { orderBy: { order: 'asc' } } },
      orderBy: { name: 'asc' },
    });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.contractTemplate.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
      include: { fields: { orderBy: { order: 'asc' } } },
    });
    if (!template) return res.status(404).json({ error: 'Template não encontrado' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, description, content, fields } = req.body;

    const template = await prisma.contractTemplate.create({
      data: {
        companyId: req.companyId,
        name, type, description, content,
        fields: { create: fields || [] },
      },
      include: { fields: true },
    });

    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, type, description, content, fields } = req.body;

    await prisma.contractTemplateField.deleteMany({ where: { templateId: req.params.id } });

    const template = await prisma.contractTemplate.update({
      where: { id: req.params.id },
      data: {
        name, type, description, content,
        fields: { create: fields || [] },
      },
      include: { fields: true },
    });

    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
