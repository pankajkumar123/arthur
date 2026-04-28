const express = require('express');
const db = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/categories', asyncHandler(async (req, res) => {
  const result = await db.query('SELECT id, name, slug FROM category ORDER BY name');
  res.json(result.rows);
}));

router.get('/products', asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const params = [];
  let sql = 'SELECT p.id, p.name, p.description, p.sku, p.price, p.image_url, c.name AS category_name, c.slug AS category_slug FROM product p LEFT JOIN category c ON c.id = p.category_id WHERE p.is_active = TRUE';

  if (category) {
    params.push(category);
    sql += ` AND c.slug = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
  }

  sql += ' ORDER BY p.name LIMIT 1000';
  const result = await db.query(sql, params);
  res.json(result.rows);
}));

router.get('/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await db.query(
    'SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM product p LEFT JOIN category c ON c.id = p.category_id WHERE p.id = $1',
    [id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(result.rows[0]);
}));

module.exports = router;
