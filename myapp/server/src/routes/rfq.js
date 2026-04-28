const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../db');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/rfq', async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      email,
      company,
      gst,
      address,
      pincode,
      city,
      state,
      agentAssist,
      items
    } = req.body;

    if (!fullName || !phone || !email || !company || !city || !state || !pincode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const rfqResult = await db.query(
      `INSERT INTO rfq_request
        (full_name, phone, email, company, gst, address, pincode, city, state, agent_assist)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        fullName,
        phone,
        email,
        company,
        gst || null,
        address || null,
        pincode,
        city,
        state,
        Boolean(agentAssist)
      ]
    );

    const rfqId = rfqResult.rows[0].id;

    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item.description || !item.quantity) {
          continue;
        }
        await db.query(
          `INSERT INTO rfq_item (rfq_id, brand, description, target_price, quantity)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            rfqId,
            item.brand || null,
            item.description,
            item.targetPrice || null,
            Number(item.quantity)
          ]
        );
      }
    }

    res.json({ rfqId });
  } catch (err) {
    next(err);
  }
});

router.post('/rfq/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file || !req.body.contact) {
      return res.status(400).json({ error: 'File and contact required' });
    }

    await db.query(
      `INSERT INTO rfq_upload (contact, file_name, file_path, mime_type, file_size)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.body.contact,
        req.file.originalname,
        req.file.filename,
        req.file.mimetype,
        req.file.size
      ]
    );

    res.json({ status: 'uploaded' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
