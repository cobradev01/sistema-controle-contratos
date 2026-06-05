const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Rota pública para assinar contrato via token
router.get('/sign/:token', async (req, res) => {
  try {
    const request = await prisma.signatureRequest.findUnique({
      where: { token: req.params.token },
      include: { contract: true },
    });

    if (!request) return res.status(404).json({ error: 'Link de assinatura inválido' });
    if (request.status === 'SIGNED') return res.status(400).json({ error: 'Contrato já assinado' });
    if (new Date() > request.expiresAt) {
      await prisma.signatureRequest.update({ where: { id: request.id }, data: { status: 'EXPIRED' } });
      return res.status(400).json({ error: 'Link de assinatura expirado' });
    }

    await prisma.signatureRequest.update({ where: { id: request.id }, data: { viewedAt: new Date(), status: 'VIEWED' } });

    res.json({ request: { id: request.id, signerName: request.signerName, status: request.status }, contract: { title: request.contract.title, content: request.contract.content } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sign/:token', async (req, res) => {
  try {
    const request = await prisma.signatureRequest.findUnique({
      where: { token: req.params.token },
      include: { contract: true },
    });

    if (!request || request.status === 'SIGNED') return res.status(400).json({ error: 'Assinatura inválida' });
    if (new Date() > request.expiresAt) return res.status(400).json({ error: 'Link expirado' });

    const now = new Date();
    await prisma.signatureRequest.update({
      where: { id: request.id },
      data: { signedAt: now, status: 'SIGNED', ipAddress: req.ip },
    });

    // Verifica se todas as assinaturas do contrato estão completas
    const pendingSignatures = await prisma.signatureRequest.count({
      where: { contractId: request.contractId, status: { not: 'SIGNED' } },
    });

    if (pendingSignatures === 0) {
      await prisma.contract.update({
        where: { id: request.contractId },
        data: { status: 'SIGNED', signedAt: now },
      });
    }

    res.json({ message: 'Contrato assinado com sucesso!', signedAt: now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use(authMiddleware);

router.post('/send', async (req, res) => {
  try {
    const { contractId, signers, channel, expiresInDays = 7 } = req.body;

    const contract = await prisma.contract.findFirst({ where: { id: contractId, companyId: req.companyId } });
    if (!contract) return res.status(404).json({ error: 'Contrato não encontrado' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const requests = await Promise.all(
      signers.map(signer =>
        prisma.signatureRequest.create({
          data: {
            contractId,
            requestedBy: req.user.id,
            signerName: signer.name,
            signerEmail: signer.email,
            signerPhone: signer.phone,
            channel: channel || 'EMAIL',
            status: 'PENDING',
            token: uuidv4(),
            expiresAt,
          },
        })
      )
    );

    await prisma.contract.update({ where: { id: contractId }, data: { status: 'PENDING_SIGNATURE' } });

    // Marca como enviado (integração real de e-mail/WhatsApp seria aqui)
    await Promise.all(requests.map(r => prisma.signatureRequest.update({ where: { id: r.id }, data: { sentAt: new Date(), status: 'SENT' } })));

    res.json({ message: 'Solicitações de assinatura enviadas', requests, signatureLinks: requests.map(r => `${process.env.FRONTEND_URL}/assinar/${r.token}`) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/contract/:contractId', authMiddleware, async (req, res) => {
  try {
    const requests = await prisma.signatureRequest.findMany({
      where: { contractId: req.params.contractId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      where: { companyId: req.companyId, status: 'PENDING_SIGNATURE' },
      include: { signatureRequests: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
