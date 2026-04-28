const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/support/messages', async (req, res, next) => {
  try {
    const { fullName, email, subject, category, message } = req.body;

    if (!fullName || !email || !subject || !category || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.query(
      `INSERT INTO support_message (full_name, email, subject, category, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [fullName, email, subject, category, message]
    );

    res.json({ status: 'received' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
