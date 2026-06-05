const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { companyName, companyCnpj, companyEmail, name, email, password } = req.body;

    const existingCompany = await prisma.company.findUnique({ where: { cnpj: companyCnpj } });
    if (existingCompany) return res.status(400).json({ error: 'CNPJ já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await prisma.company.create({
      data: {
        name: companyName,
        cnpj: companyCnpj,
        email: companyEmail,
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN',
          },
        },
      },
      include: { users: true },
    });

    const user = company.users[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      company: { id: company.id, name: company.name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, cnpj } = req.body;

    const company = await prisma.company.findUnique({ where: { cnpj } });
    if (!company) return res.status(401).json({ error: 'Empresa não encontrada' });

    const user = await prisma.user.findFirst({
      where: { email, companyId: company.id, active: true },
    });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      company: { id: company.id, name: company.name, cnpj: company.cnpj },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
    company: { id: req.user.company.id, name: req.user.company.name },
  });
});

module.exports = router;
