-- Simple Test Data Setup for E-Commerce Purchase Testing
-- This script creates all necessary tables if they don't exist, then adds test data

-- ============================================
-- CREATE TABLES (if not exist)
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6),
  gst_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  subtotal DECIMAL(10, 2),
  gst_amount DECIMAL(10, 2),
  shipping_cost DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'confirmed',
  delivery_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(255),
  product_sku VARCHAR(100),
  quantity INTEGER,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  razorpay_payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  amount INTEGER,
  currency VARCHAR(3) DEFAULT 'INR',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  invoice_number VARCHAR(50),
  invoice_date TIMESTAMP,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INSERT TEST DATA
-- ============================================

-- Delete existing test data if present
DELETE FROM customers WHERE email = 'umeshcholleti25@gmail.com';
DELETE FROM products WHERE name LIKE '%Test Product%';

-- Insert test product
INSERT INTO products (name, description, category, price, stock_quantity, image_url)
VALUES (
  'Test Product - 1 Rupee',
  'This is a test product for verifying checkout, payment, and invoice functionality',
  'Testing',
  1.00,
  1000,
  'https://via.placeholder.com/300x300?text=Test+Product+1+Rupee'
);

-- Insert test customer
INSERT INTO customers (email, password_hash, name, phone, address, city, state, pincode, gst_number)
VALUES (
  'umeshcholleti25@gmail.com',
  '$2b$10$YIpxrvg.OvYYzwGLCdE8eO6Y3oIpsJ0RHfKBp9lNKhNZ0h5TZDnJO',
  'Umesh Cholleti',
  '9876543210',
  '123 Test Street',
  'Bangalore',
  'Karnataka',
  '560001',
  'GST12345TESTUSER'
)
ON CONFLICT (email) DO NOTHING;

-- Insert company settings
DELETE FROM system_settings WHERE key IN ('COMPANY_NAME', 'COMPANY_ADDRESS', 'COMPANY_PHONE', 'COMPANY_EMAIL', 'COMPANY_GST_NUMBER');

INSERT INTO system_settings (key, value) VALUES
  ('COMPANY_NAME', 'Sai Scientifics'),
  ('COMPANY_ADDRESS', 'Plot No. 123, Test Industrial Area, Bangalore - 560001, Karnataka'),
  ('COMPANY_PHONE', '+91-9876543210'),
  ('COMPANY_EMAIL', 'contactus@saiscientifics.com'),
  ('COMPANY_GST_NUMBER', '27AAACR5055K1Z0'),
  ('COMPANY_PAN', 'AAACR5055K'),
  ('CURRENCY_SYMBOL', '₹');

-- ============================================
-- VERIFY DATA
-- ============================================

SELECT '✓ Test Product Created' as status, COUNT(*) as count FROM products WHERE name LIKE '%Test%';
SELECT '✓ Test Customer Created' as status, COUNT(*) as count FROM customers WHERE email = 'umeshcholleti25@gmail.com';
SELECT '✓ Company Settings Created' as status, COUNT(*) as count FROM system_settings WHERE key LIKE 'COMPANY%';

-- ============================================
-- FINAL VERIFICATION
-- ============================================

SELECT 'Setup Complete!' as message,
  (SELECT COUNT(*) FROM products WHERE name LIKE '%Test%') as test_products,
  (SELECT COUNT(*) FROM customers WHERE email = 'umeshcholleti25@gmail.com') as test_customers,
  (SELECT COUNT(*) FROM system_settings WHERE key LIKE 'COMPANY%') as company_settings;
