const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = require('../lib/prisma');

const router = express.Router();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function sendResetEmail(email, name, resetUrl) {
  // Log no console sempre (útil para debug/demo)
  console.log('\n========== RESET DE SENHA ==========');
  console.log(`Usuário: ${name} <${email}>`);
  console.log(`Link: ${resetUrl}`);
  console.log('=====================================\n');

  // Tenta enviar por e-mail se SMTP estiver configurado
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'seu_email@gmail.com') {
    return { sent: false, link: resetUrl };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Sistema B2B" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Redefinição de Senha — B2B Soluções Financeiras',
    html: `
      <div style="font-family:Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f4f5f7;border-radius:12px;">
        <div style="background:#fff;border-radius:10px;padding:32px;border:1px solid #e4e7ec;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-flex;width:48px;height:48px;background:#2563eb;border-radius:12px;align-items:center;justify-content:center;">
              <span style="color:#fff;font-size:22px;">🔐</span>
            </div>
            <h2 style="color:#101828;margin:12px 0 4px;font-size:20px;">Redefinição de Senha</h2>
            <p style="color:#667085;margin:0;font-size:14px;">B2B Soluções Financeiras</p>
          </div>
          <p style="color:#344054;font-size:14px;line-height:1.6;">Olá, <strong>${name}</strong>!</p>
          <p style="color:#344054;font-size:14px;line-height:1.6;">
            Recebemos uma solicitação para redefinir a senha da sua conta.
            Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}"
               style="background:#2563eb;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
              Redefinir Minha Senha
            </a>
          </div>
          <p style="color:#667085;font-size:12px;line-height:1.6;border-top:1px solid #e4e7ec;padding-top:16px;margin-bottom:0;">
            Se você não solicitou a redefinição de senha, ignore este e-mail.
            Sua senha permanece a mesma e nenhuma ação é necessária.
            <br/><br/>
            Por segurança, nunca compartilhe este link com ninguém.
          </p>
        </div>
      </div>
    `,
  });

  return { sent: true };
}

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, cnpj } = req.body;

    if (!email || !cnpj) {
      return res.status(400).json({ error: 'E-mail e CNPJ são obrigatórios' });
    }

    // Busca empresa pelo CNPJ
    const company = await prisma.company.findUnique({ where: { cnpj } });
    if (!company) {
      // Responde genérico por segurança (não revela se CNPJ existe)
      return res.json({ message: 'Se os dados estiverem corretos, você receberá um e-mail em breve.' });
    }

    // Busca usuário
    const user = await prisma.user.findFirst({
      where: { email, companyId: company.id, active: true },
    });

    if (!user) {
      return res.json({ message: 'Se os dados estiverem corretos, você receberá um e-mail em breve.' });
    }

    // Gera token seguro
    const token = generateToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/redefinir-senha/${token}`;
    const result = await sendResetEmail(user.email, user.name, resetUrl);

    res.json({
      message: 'Se os dados estiverem corretos, você receberá um e-mail em breve.',
      // Em demo/dev, retorna o link direto para facilitar testes
      ...(process.env.NODE_ENV !== 'production' && { resetLink: resetUrl }),
      emailSent: result.sent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
        active: true,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Link inválido ou expirado. Solicite um novo.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        entityType: 'user',
        entityId: user.id,
        action: 'PASSWORD_RESET',
      },
    });

    res.json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// GET /api/auth/validate-reset-token/:token — valida token antes de mostrar formulário
router.get('/validate-reset-token/:token', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: req.params.token,
        passwordResetExpires: { gt: new Date() },
        active: true,
      },
      select: { name: true, email: true },
    });

    if (!user) {
      return res.status(400).json({ valid: false, error: 'Link inválido ou expirado' });
    }

    res.json({ valid: true, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
