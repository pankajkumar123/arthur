-- Database Setup Script for Real-Time Purchase Testing
-- Run this on your PostgreSQL database: myapp

-- ============================================
-- 1. CREATE TEST PRODUCT (₹1)
-- ============================================

INSERT INTO products (
  name, 
  description, 
  category, 
  price, 
  stock_quantity, 
  image_url, 
  created_at, 
  updated_at
) VALUES (
  'Test Product - 1 Rupee',
  'This is a special test product for verifying checkout, payment, and invoice functionality. Perfect for testing the complete e-commerce workflow.',
  'Testing',
  1.00,
  1000,
  'https://via.placeholder.com/300x300?text=Test+Product+1+Rupee',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. CREATE TEST USER ACCOUNT (if not exists)
-- ============================================

-- First, insert customer if not exists
INSERT INTO customers (
  email,
  password_hash,
  name,
  phone,
  address,
  city,
  state,
  pincode,
  gst_number,
  created_at,
  updated_at
) VALUES (
  'umeshcholleti25@gmail.com',
  '$2b$10$YIpxrvg.OvYYzwGLCdE8eO6Y3oIpsJ0RHfKBp9lNKhNZ0h5TZDnJO', -- Password: Umesh@12345 (bcrypt hashed)
  'Umesh Cholleti',
  '9876543210',
  '123 Test Street',
  'Bangalore',
  'Karnataka',
  '560001',
  'GST12345TESTUSER',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 3. VERIFY COMPANY DETAILS IN SETTINGS
-- ============================================

-- Update company info for invoices
UPDATE system_settings SET value = 'Sai Scientifics' WHERE key = 'COMPANY_NAME';
UPDATE system_settings SET value = 'Plot No. 123, Test Industrial Area, Bangalore - 560001, Karnataka' WHERE key = 'COMPANY_ADDRESS';
UPDATE system_settings SET value = '+91-9876543210' WHERE key = 'COMPANY_PHONE';
UPDATE system_settings SET value = 'contactus@saiscientifics.com' WHERE key = 'COMPANY_EMAIL';
UPDATE system_settings SET value = '27AAACR5055K1Z0' WHERE key = 'COMPANY_GST_NUMBER';
UPDATE system_settings SET value = '₹1' WHERE key = 'CURRENCY_SYMBOL';

-- If table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO system_settings (key, value) VALUES
  ('COMPANY_NAME', 'Sai Scientifics'),
  ('COMPANY_ADDRESS', 'Plot No. 123, Test Industrial Area, Bangalore - 560001, Karnataka'),
  ('COMPANY_PHONE', '+91-9876543210'),
  ('COMPANY_EMAIL', 'contactus@saiscientifics.com'),
  ('COMPANY_GST_NUMBER', '27AAACR5055K1Z0'),
  ('COMPANY_PAN', 'AAACR5055K'),
  ('COMPANY_TERMS', 'All products are subject to availability. Returns accepted within 30 days.')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 4. VERIFY DATABASE TABLES
-- ============================================

-- Check if all required tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✓ Exists'
    ELSE '✗ Missing'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'customers',
    'products',
    'cart',
    'orders',
    'order_items',
    'transactions',
    'invoices'
  )
ORDER BY table_name;

-- ============================================
-- 5. VERIFY TEST DATA
-- ============================================

-- Check test product
SELECT id, name, price, stock_quantity FROM products WHERE name LIKE '%Test Product%';

-- Check test user
SELECT id, email, name, phone FROM customers WHERE email = 'umeshcholleti25@gmail.com';

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Total products count
SELECT COUNT(*) as total_products FROM products;

-- Total customers count
SELECT COUNT(*) as total_customers FROM customers;

-- Products with price <= 1
SELECT id, name, price FROM products WHERE price <= 1.00 ORDER BY price ASC;
