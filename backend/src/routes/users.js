const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { companyId: req.companyId },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { companyId: req.companyId, name, email, password: hashedPassword, role: role || 'USER' },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'E-mail já cadastrado nesta empresa' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, role, active } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, role, active },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
