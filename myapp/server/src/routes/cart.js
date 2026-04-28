const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { ValidationError, NotFoundError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /api/cart
 * Get current user's cart
 */
router.get('/cart', authenticateToken, asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT c.id, c.product_id, c.quantity, c.added_at,
            p.name, p.price, p.image_url, c.notes
     FROM cart c
     JOIN product p ON p.id = c.product_id
     WHERE c.customer_id = $1
     ORDER BY c.added_at DESC`,
    [req.user.id]
  );

  res.json(result.rows);
}));

/**
 * POST /api/cart/add
 * Add product to cart
 */
router.post('/cart/add', authenticateToken, asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate input
  if (!productId || !quantity) {
    throw new ValidationError('Product ID and quantity required');
  }

  if (quantity < 1 || quantity > 10000) {
    throw new ValidationError('Quantity must be between 1 and 10000');
  }

  // Check if product exists
  const productResult = await db.query(
    'SELECT id, name, price FROM product WHERE id = $1 AND is_active = TRUE',
    [productId]
  );

  if (productResult.rows.length === 0) {
    throw new NotFoundError('Product');
  }

  const product = productResult.rows[0];

  // Check if already in cart
  const existingCart = await db.query(
    'SELECT id, quantity FROM cart WHERE customer_id = $1 AND product_id = $2',
    [req.user.id, productId]
  );

  let result;
  if (existingCart.rows.length > 0) {
    // Update quantity
    const newQuantity = existingCart.rows[0].quantity + parseInt(quantity);
    result = await db.query(
      'UPDATE cart SET quantity = $1, added_at = NOW() WHERE id = $2 RETURNING id, product_id, quantity',
      [newQuantity, existingCart.rows[0].id]
    );
  } else {
    // Add new item
    result = await db.query(
      'INSERT INTO cart (customer_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id, product_id, quantity',
      [req.user.id, productId, quantity]
    );
  }

  logger.info('Product added to cart', {
    customerId: req.user.id,
    productId,
    quantity,
    productName: product.name
  });

  res.status(201).json({
    id: result.rows[0].id,
    productId: result.rows[0].product_id,
    quantity: result.rows[0].quantity
  });
}));

/**
 * PUT /api/cart/:cartItemId
 * Update cart item quantity
 */
router.put('/cart/:cartItemId', authenticateToken, asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    throw new ValidationError('Quantity required');
  }

  if (quantity < 1 || quantity > 10000) {
    throw new ValidationError('Quantity must be between 1 and 10000');
  }

  // Verify item belongs to user
  const cartItem = await db.query(
    'SELECT id FROM cart WHERE id = $1 AND customer_id = $2',
    [cartItemId, req.user.id]
  );

  if (cartItem.rows.length === 0) {
    throw new NotFoundError('Cart item');
  }

  const result = await db.query(
    'UPDATE cart SET quantity = $1, added_at = NOW() WHERE id = $2 RETURNING id, product_id, quantity',
    [quantity, cartItemId]
  );

  logger.info('Cart item updated', {
    customerId: req.user.id,
    cartItemId,
    newQuantity: quantity
  });

  res.json({ id: result.rows[0].id, quantity: result.rows[0].quantity });
}));

/**
 * DELETE /api/cart/:cartItemId
 * Remove item from cart
 */
router.delete('/cart/:cartItemId', authenticateToken, asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;

  // Verify item belongs to user
  const cartItem = await db.query(
    'SELECT id FROM cart WHERE id = $1 AND customer_id = $2',
    [cartItemId, req.user.id]
  );

  if (cartItem.rows.length === 0) {
    throw new NotFoundError('Cart item');
  }

  await db.query('DELETE FROM cart WHERE id = $1', [cartItemId]);

  logger.info('Cart item removed', {
    customerId: req.user.id,
    cartItemId
  });

  res.json({ message: 'Item removed from cart' });
}));

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/cart', authenticateToken, asyncHandler(async (req, res) => {
  await db.query('DELETE FROM cart WHERE customer_id = $1', [req.user.id]);

  logger.info('Cart cleared', { customerId: req.user.id });

  res.json({ message: 'Cart cleared' });
}));

module.exports = router;
