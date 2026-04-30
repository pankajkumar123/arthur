const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

/**
 * ENV CONFIG
 */
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * HELPERS
 */
function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone || null,
    role: user.role || 'customer'
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName || user.full_name,
      role: user.role || 'customer'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

function requireAuth(req, res) {
  const token = getBearerToken(req);

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return null;
  }
}

/**
 * REGISTER ROUTE
 */
router.post('/register', async (req, res) => {
  try {
    const { fullName, name, email, phone, password } = req.body || {};
    const displayName = fullName || name;

    // Basic validation
    if (!displayName || !email || !password) {
      return res.status(400).json({
        message: 'Full name, email and password are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await db.query(
      'SELECT id FROM customer_user WHERE email = $1',
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      `INSERT INTO customer_user
      (full_name, email, phone, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, phone`,
      [
        displayName.trim(),
        cleanEmail,
        phone || null,
        passwordHash
      ]
    );

    const user = {
      ...result.rows[0],
      role: 'customer'
    };

    // Generate token
    const token = generateToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      user: toPublicUser(user),
      userId: user.id,
      token
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({
      message: 'Server error during registration'
    });
  }
});

/**
 * LOGIN ROUTE
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user
    const result = await db.query(
      `SELECT id, full_name, email, phone, password_hash
       FROM customer_user
       WHERE email = $1`,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = {
      ...result.rows[0],
      role: 'customer'
    };

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      user: toPublicUser(user),
      userId: user.id,
      token
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({
      message: 'Server error during login'
    });
  }
});

/**
 * CURRENT USER ROUTE
 */
router.get('/me', async (req, res) => {
  const decoded = requireAuth(req, res);
  if (!decoded) return;

  try {
    const result = await db.query(
      `SELECT id, full_name, email, phone
       FROM customer_user
       WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = toPublicUser({
      ...result.rows[0],
      role: decoded.role || 'customer'
    });

    return res.json({
      ...user,
      user
    });
  } catch (error) {
    console.error('AUTH ME ERROR:', error);
    return res.status(500).json({ message: 'Server error while loading profile' });
  }
});

/**
 * UPDATE PROFILE ROUTE
 */
router.put('/profile', async (req, res) => {
  const decoded = requireAuth(req, res);
  if (!decoded) return;

  try {
    const { fullName, phone } = req.body || {};
    const updates = [];
    const values = [];

    if (fullName && fullName.trim()) {
      values.push(fullName.trim());
      updates.push(`full_name = $${values.length}`);
    }

    if (phone !== undefined) {
      values.push(phone || null);
      updates.push(`phone = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No profile fields to update' });
    }

    values.push(decoded.id);
    const result = await db.query(
      `UPDATE customer_user
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, full_name, email, phone`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = toPublicUser({
      ...result.rows[0],
      role: decoded.role || 'customer'
    });

    return res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('PROFILE UPDATE ERROR:', error);
    return res.status(500).json({ message: 'Server error while updating profile' });
  }
});

/**
 * CHANGE PASSWORD ROUTE
 */
router.post('/change-password', async (req, res) => {
  const decoded = requireAuth(req, res);
  if (!decoded) return;

  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters'
      });
    }

    const result = await db.query(
      'SELECT password_hash FROM customer_user WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE customer_user SET password_hash = $1 WHERE id = $2',
      [passwordHash, decoded.id]
    );

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error);
    return res.status(500).json({ message: 'Server error while changing password' });
  }
});

/**
 * LOGOUT ROUTE
 *
 * JWT logout is handled client-side by removing the token. This endpoint keeps
 * the frontend call from failing when a user signs out.
 */
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

/**
 * EXPORT ROUTER
 */
module.exports = router;
