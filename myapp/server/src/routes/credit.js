const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

function generateReference() {
  const stamp = Date.now().toString().slice(-6);
  const rand = crypto.randomInt(100, 999);
  return `BOC-${stamp}-${rand}`;
}

router.post('/credit-applications', async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      dob,
      panNumber,
      address,
      city,
      state,
      pincode,
      residenceType,
      employmentType,
      monthlyIncome,
      company,
      creditAmount,
      repaymentPeriod
    } = req.body;

    if (!fullName || !email || !phone || !dob || !panNumber || !address || !city || !state || !pincode || !residenceType || !employmentType || !monthlyIncome || !creditAmount || !repaymentPeriod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const referenceId = generateReference();

    await db.query(
      `INSERT INTO credit_application
        (reference_id, full_name, email, phone, dob, pan_number, address, city, state, pincode, residence_type, employment_type, monthly_income, company, credit_amount, repayment_period)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        referenceId,
        fullName,
        email,
        phone,
        dob,
        panNumber,
        address,
        city,
        state,
        pincode,
        residenceType,
        employmentType,
        Number(monthlyIncome),
        company || null,
        Number(creditAmount),
        Number(repaymentPeriod)
      ]
    );

    res.json({ referenceId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
