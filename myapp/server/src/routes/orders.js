const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { ValidationError, NotFoundError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

function generateOrderNumber() {
  const stamp = Date.now().toString().slice(-8);
  const rand = crypto.randomInt(10000, 99999);
  return `ORD-${stamp}-${rand}`;
}

/**
 * POST /api/orders/create
 * Create order from user's cart
 */
router.post('/orders/create', authenticateToken, asyncHandler(async (req, res) => {
  const { addressLine, city, state, pincode, paymentMethod } = req.body;

  // Validate input
  if (!addressLine || !city || !state || !pincode || !paymentMethod) {
    throw new ValidationError('All address and payment fields required');
  }

  if (!/^\d{6}$/.test(pincode)) {
    throw new ValidationError('Pincode must be 6 digits');
  }

  // Get user data
  const userResult = await db.query(
    'SELECT full_name, email, phone FROM customer_user WHERE id = $1',
    [req.user.id]
  );

  if (userResult.rows.length === 0) {
    throw new NotFoundError('User');
  }

  const user = userResult.rows[0];

  // Get cart items
  const cartItems = await db.query(
    `SELECT c.id, c.product_id, c.quantity, p.price, p.name
     FROM cart c
     JOIN product p ON p.id = c.product_id
     WHERE c.customer_id = $1`,
    [req.user.id]
  );

  if (cartItems.rows.length === 0) {
    throw new ValidationError('Cart is empty');
  }

  // Calculate totals
  let subtotal = 0;
  cartItems.rows.forEach(item => {
    subtotal += parseFloat(item.price) * item.quantity;
  });

  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const shipping = subtotal > 5000 ? 0 : 100;
  const totalAmount = subtotal + gst + shipping;

  // Create order in database (using transaction)
  const orderNumber = generateOrderNumber();

  const orderResult = await db.query(
    `INSERT INTO orders (customer_id, order_number, subtotal, gst_amount, shipping_cost, total_amount, payment_method, delivery_address, city, state, pincode, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id, order_number, total_amount`,
    [
      req.user.id,
      orderNumber,
      subtotal,
      gst,
      shipping,
      totalAmount,
      paymentMethod,
      addressLine,
      city,
      state,
      pincode,
      'pending'
    ]
  );

  const orderId = orderResult.rows[0].id;

  // Create order items
  for (const item of cartItems.rows) {
    await db.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)`,
      [orderId, item.product_id, item.quantity, item.price]
    );
  }

  // Clear user's cart
  await db.query('DELETE FROM cart WHERE customer_id = $1', [req.user.id]);

  logger.info('Order created', {
    customerId: req.user.id,
    orderId,
    orderNumber,
    totalAmount,
    paymentMethod
  });

  res.status(201).json({
    orderId,
    orderNumber,
    totalAmount,
    subtotal,
    gst,
    shipping,
    paymentMethod
  });
}));

/**
 * GET /api/orders/history
 * Get user's order history
 */
router.get('/orders/history', authenticateToken, asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, order_number, total_amount, status, created_at, delivery_address, city, state
     FROM orders
     WHERE customer_id = $1
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  res.json(result.rows);
}));

/**
 * GET /api/orders/:orderId
 * Get specific order details
 */
router.get('/orders/:orderId', authenticateToken, asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Get order
  const orderResult = await db.query(
    `SELECT id, order_number, subtotal, gst_amount, shipping_cost, total_amount, payment_method, 
            delivery_address, city, state, pincode, status, created_at
     FROM orders
     WHERE id = $1 AND customer_id = $2`,
    [orderId, req.user.id]
  );

  if (orderResult.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  const order = orderResult.rows[0];

  // Get order items
  const itemsResult = await db.query(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, p.name, p.image_url
     FROM order_items oi
     JOIN product p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  res.json({
    ...order,
    items: itemsResult.rows
  });
}));

/**
 * PATCH /api/orders/:orderId/status
 * Update order status (admin only)
 */
router.patch('/orders/:orderId/status', authenticateToken, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Get order to verify user can access it
  const orderResult = await db.query(
    'SELECT id FROM orders WHERE id = $1 AND customer_id = $2',
    [orderId, req.user.id]
  );

  if (orderResult.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  await db.query(
    'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
    [status, orderId]
  );

  logger.info('Order status updated', {
    orderId,
    newStatus: status,
    customerId: req.user.id
  });

  res.json({ message: 'Order status updated', status });
}));

module.exports = router;
