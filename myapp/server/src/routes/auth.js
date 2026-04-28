const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const logger = require('../utils/logger');
const { validateRegistration, validateLogin, sanitizeString } = require('../utils/validator');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, ConflictError, UnauthorizedError, ValidationError } = require('../middleware/errorHandler');

const router = express.Router();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role || 'customer'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/register
 * Register a new customer account
 */
router.post('/auth/register', asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  
  // Validate input
  const errors = validateRegistration({ fullName, email, phone, password });
  if (Object.keys(errors).length > 0) {
    logger.warn('Registration validation failed', { errors, email });
    throw new ValidationError('Validation failed', errors);
  }
  
  // Sanitize inputs
  const sanitizedName = sanitizeString(fullName, 100);
  const sanitizedEmail = email.toLowerCase().trim();
  
  // Check if email already exists
  const existing = await db.query(
    'SELECT id FROM customer_user WHERE email = $1',
    [sanitizedEmail]
  );
  
  if (existing.rows.length > 0) {
    logger.warn('Registration attempt with existing email', { email: sanitizedEmail });
    throw new ConflictError('Email already registered');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user
  const result = await db.query(
    `INSERT INTO customer_user (full_name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email, phone, created_at`,
    [sanitizedName, sanitizedEmail, phone || null, passwordHash]
  );
  
  const user = result.rows[0];
  
  // Generate JWT token
  const token = generateToken(user);
  
  logger.info('User registered successfully', {
    userId: user.id,
    email: user.email
  });
  
  res.status(201).json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone
    }
  });
}));

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  const errors = validateLogin({ email, password });
  if (Object.keys(errors).length > 0) {
    logger.warn('Login validation failed', { errors, email });
    throw new ValidationError('Validation failed', errors);
  }
  
  const sanitizedEmail = email.toLowerCase().trim();
  
  // Find user
  const result = await db.query(
    `SELECT id, full_name, email, phone, password_hash, role
     FROM customer_user
     WHERE email = $1`,
    [sanitizedEmail]
  );
  
  if (result.rows.length === 0) {
    logger.warn('Login attempt with unknown email', { email: sanitizedEmail });
    throw new UnauthorizedError('Invalid email or password');
  }
  
  const user = result.rows[0];
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!isValidPassword) {
    logger.warn('Login attempt with invalid password', {
      userId: user.id,
      email: sanitizedEmail
    });
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // Generate JWT token
  const token = generateToken(user);
  
  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email
  });
  
  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
}));

/**
 * POST /api/auth/logout
 * Logout (JWT tokens are stateless, so this is mostly for logging)
 */
router.post('/auth/logout', authenticateToken, (req, res) => {
  logger.info('User logged out', {
    userId: req.user.id,
    email: req.user.email
  });
  
  res.json({
    message: 'Logged out successfully'
  });
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/auth/me', authenticateToken, asyncHandler(async (req, res) => {
  // Fetch fresh user data from database
  const result = await db.query(
    `SELECT id, full_name, email, phone, role, created_at
     FROM customer_user
     WHERE id = $1`,
    [req.user.id]
  );
  
  if (result.rows.length === 0) {
    throw new UnauthorizedError('User not found');
  }
  
  const user = result.rows[0];
  
  res.json({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.created_at
  });
}));

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/auth/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  
  const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (fullName) {
    const sanitizedName = sanitizeString(fullName, 100);
    updates.push(`full_name = $${paramCount++}`);
    values.push(sanitizedName);
  }
  
  if (phone) {
    updates.push(`phone = $${paramCount++}`);
    values.push(phone);
  }
  
  if (updates.length === 0) {
    throw new ValidationError('No fields to update');
  }
  
  values.push(req.user.id);
  
  const result = await db.query(
    `UPDATE customer_user
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING id, full_name, email, phone`,
    values
  );
  
  logger.info('User profile updated', {
    userId: req.user.id,
    fields: Object.keys(req.body)
  });
  
  res.json({
    user: {
      id: result.rows[0].id,
      fullName: result.rows[0].full_name,
      email: result.rows[0].email,
      phone: result.rows[0].phone
    }
  });
}));

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/auth/change-password', authenticateToken, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw new ValidationError('Current password and new password required');
  }
  
  if (newPassword.length < 8) {
    throw new ValidationError('New password must be at least 8 characters');
  }
  
  // Get current password hash
  const result = await db.query(
    'SELECT password_hash FROM customer_user WHERE id = $1',
    [req.user.id]
  );
  
  if (result.rows.length === 0) {
    throw new UnauthorizedError('User not found');
  }
  
  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  
  if (!isValid) {
    logger.warn('Password change attempt with invalid current password', {
      userId: req.user.id
    });
    throw new UnauthorizedError('Current password is incorrect');
  }
  
  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  
  // Update password
  await db.query(
    'UPDATE customer_user SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, req.user.id]
  );
  
  logger.info('User password changed', { userId: req.user.id });
  
  res.json({
    message: 'Password changed successfully'
  });
}));

module.exports = router;
