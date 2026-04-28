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

const upload = multer({ dest: uploadDir, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/reviews', upload.array('photos', 5), async (req, res, next) => {
  try {
    const { rating, title, details, pros, cons, recommend } = req.body;

    if (!rating || !title || !details) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reviewResult = await db.query(
      `INSERT INTO review (rating, title, details, pros, cons, recommend)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        Number(rating),
        title,
        details,
        pros || null,
        cons || null,
        recommend === 'true' || recommend === true
      ]
    );

    const reviewId = reviewResult.rows[0].id;

    if (req.files && req.files.length) {
      for (const file of req.files) {
        await db.query(
          `INSERT INTO review_photo (review_id, file_name, file_path, mime_type, file_size)
           VALUES ($1, $2, $3, $4, $5)`,
          [reviewId, file.originalname, file.filename, file.mimetype, file.size]
        );
      }
    }

    res.json({ reviewId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
