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

router.post('/grievances', upload.array('attachments', 5), async (req, res, next) => {
  try {
    const { fullName, email, phone, grievanceType, orderNumber, subject, description, incidentDate } = req.body;

    if (!fullName || !email || !phone || !grievanceType || !subject || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const grievanceResult = await db.query(
      `INSERT INTO grievance
        (full_name, email, phone, grievance_type, order_number, subject, description, incident_date)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        fullName,
        email,
        phone,
        grievanceType,
        orderNumber || null,
        subject,
        description,
        incidentDate || null
      ]
    );

    const grievanceId = grievanceResult.rows[0].id;

    if (req.files && req.files.length) {
      for (const file of req.files) {
        await db.query(
          `INSERT INTO grievance_attachment (grievance_id, file_name, file_path, mime_type, file_size)
           VALUES ($1, $2, $3, $4, $5)`,
          [grievanceId, file.originalname, file.filename, file.mimetype, file.size]
        );
      }
    }

    res.json({ grievanceId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
