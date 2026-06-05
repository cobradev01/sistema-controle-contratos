const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/:entityType/:entityId', upload.array('files', 10), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const uploads = await Promise.all(
      req.files.map(file =>
        prisma.upload.create({
          data: {
            entityType,
            entityId,
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `${baseUrl}/uploads/${file.filename}`,
          },
        })
      )
    );

    res.status(201).json(uploads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:entityType/:entityId', async (req, res) => {
  try {
    const uploads = await prisma.upload.findMany({
      where: { entityType: req.params.entityType, entityId: req.params.entityId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
