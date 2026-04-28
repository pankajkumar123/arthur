const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

async function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const result = await db.query(
    `SELECT s.id, s.admin_id, s.expires_at
     FROM admin_session s
     WHERE s.token = $1`,
    [token]
  );

  if (!result.rows.length) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const session = result.rows[0];
  if (new Date(session.expires_at) < new Date()) {
    return res.status(401).json({ error: 'Session expired' });
  }

  req.adminId = session.admin_id;
  next();
}

router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await db.query(
      `SELECT id, full_name
       FROM admin_user
       WHERE email = $1 AND password_hash = crypt($2, password_hash)`,
      [email, password]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8);

    await db.query(
      `INSERT INTO admin_session (admin_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [result.rows[0].id, token, expiresAt]
    );

    res.json({ token, adminName: result.rows[0].full_name });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/logout', requireAdmin, async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    await db.query('DELETE FROM admin_session WHERE token = $1', [token]);
    res.json({ status: 'logged_out' });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/rfq', requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.full_name, r.email, r.phone, r.company, r.created_at,
              json_agg(json_build_object(
                'brand', i.brand,
                'description', i.description,
                'target_price', i.target_price,
                'quantity', i.quantity
              )) AS items
       FROM rfq_request r
       LEFT JOIN rfq_item i ON i.rfq_id = r.id
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/admin/credit', requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT reference_id, full_name, email, phone, credit_amount, repayment_period, status, created_at
       FROM credit_application
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/admin/orders', requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT order_number, customer_name, email, phone, total, status, created_at
       FROM customer_order
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/admin/reviews', requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.rating, r.title, r.details, r.pros, r.cons, r.recommend, r.created_at,
              json_agg(json_build_object(
                'file_name', p.file_name,
                'file_path', p.file_path
              )) AS photos
       FROM review r
       LEFT JOIN review_photo p ON p.review_id = r.id
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/admin/grievances', requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT g.id, g.full_name, g.email, g.phone, g.grievance_type, g.subject, g.created_at,
              json_agg(json_build_object(
                'file_name', a.file_name,
                'file_path', a.file_path
              )) AS attachments
       FROM grievance g
       LEFT JOIN grievance_attachment a ON a.grievance_id = g.id
       GROUP BY g.id
       ORDER BY g.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/admin/support', requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT full_name, email, subject, category, message, created_at
       FROM support_message
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/admin/products', requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.sku, p.price, p.image_url, p.is_active,
              c.name AS category_name, c.slug AS category_slug
       FROM product p
       LEFT JOIN category c ON c.id = p.category_id
       ORDER BY p.name`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post('/admin/products', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, sku, price, imageUrl, categorySlug, isActive = true } = req.body;
    if (!name || !sku || !price) {
      return res.status(400).json({ error: 'name, sku, and price required' });
    }

    const category = categorySlug
      ? await db.query('SELECT id FROM category WHERE slug = $1', [categorySlug])
      : { rows: [] };

    const result = await db.query(
      `INSERT INTO product (category_id, name, description, sku, price, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        category.rows[0]?.id || null,
        name,
        description || null,
        sku,
        Number(price),
        imageUrl || null,
        Boolean(isActive)
      ]
    );

    res.json({ id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

router.patch('/admin/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, sku, price, imageUrl, categorySlug, isActive } = req.body;

    const category = categorySlug
      ? await db.query('SELECT id FROM category WHERE slug = $1', [categorySlug])
      : { rows: [] };

    await db.query(
      `UPDATE product
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           sku = COALESCE($3, sku),
           price = COALESCE($4, price),
           image_url = COALESCE($5, image_url),
           category_id = COALESCE($6, category_id),
           is_active = COALESCE($7, is_active)
       WHERE id = $8`,
      [
        name || null,
        description || null,
        sku || null,
        price !== undefined ? Number(price) : null,
        imageUrl || null,
        category.rows[0]?.id || null,
        isActive !== undefined ? Boolean(isActive) : null,
        req.params.id
      ]
    );

    res.json({ status: 'updated' });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/products/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM product WHERE id = $1', [req.params.id]);
    res.json({ status: 'deleted' });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/categories', requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, slug FROM category ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post('/admin/categories', requireAdmin, async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug required' });
    }

    const result = await db.query(
      'INSERT INTO category (name, slug) VALUES ($1, $2) RETURNING id',
      [name, slug]
    );

    res.json({ id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

router.patch('/admin/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    await db.query(
      `UPDATE category
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug)
       WHERE id = $3`,
      [name || null, slug || null, req.params.id]
    );
    res.json({ status: 'updated' });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM category WHERE id = $1', [req.params.id]);
    res.json({ status: 'deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
