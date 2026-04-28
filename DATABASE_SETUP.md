# Database Setup and Migration Guide

Complete guide for setting up the PostgreSQL database for Sai Scientifics application.

---

## 📊 Database Schema Overview

The application uses PostgreSQL with the following tables:
- `users` - User accounts and authentication
- `products` - Product catalog
- `cart` - Shopping cart items
- `orders` - Order information
- `order_items` - Order line items
- `rfq` - Request for quote submissions
- `rfq_items` - RFQ line items

---

## 🔧 Option 1: Continue Using Supabase (Recommended)

Your database is already set up on Supabase. No migration needed!

**Advantages:**
- Already configured and working
- Automatic backups
- Free tier available
- Easy scaling
- Built-in authentication

**Keep Current Configuration:**
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## 🔧 Option 2: Migrate to Hostinger PostgreSQL

If you prefer to host the database on Hostinger:

### Step 1: Create Database on Hostinger

1. Login to Hostinger hPanel
2. Go to **Databases → PostgreSQL Databases**
3. Click **Create New Database**
4. Fill in details:
   - Database Name: `saiscientifics_db`
   - Username: Choose a username
   - Password: Generate strong password
5. Note the connection details

### Step 2: Export from Supabase

**Method A: Using Supabase Dashboard**
1. Go to Supabase Dashboard → Database
2. Select **Backups**
3. Download latest backup or create new backup
4. Download the `.sql` file

**Method B: Using pg_dump (if you have direct access)**
```bash
pg_dump postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres > backup.sql
```

### Step 3: Import to Hostinger

**Method A: Using phpPgAdmin (Hostinger)**
1. Go to Hostinger hPanel → Databases → phpPgAdmin
2. Select your database
3. Go to **SQL** tab
4. Copy and paste the SQL from backup file
5. Click **Execute**

**Method B: Using psql (SSH)**
```bash
# SSH into Hostinger server
psql -h localhost -U your_db_user -d saiscientifics_db < backup.sql
```

### Step 4: Update Backend Configuration

Update `myapp/server/.env`:
```env
DATABASE_URL=postgresql://your_db_user:your_password@localhost:5432/saiscientifics_db
```

### Step 5: Test Connection

Run the test script:
```bash
cd myapp/server
node test-db-connection.js
```

---

## 🗂️ Database Schema SQL

If you need to create the schema manually, here's the complete schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    gst_amount DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    delivery_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RFQ (Request for Quote) table
CREATE TABLE rfq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    delivery_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    special_requirements TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RFQ items table
CREATE TABLE rfq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES rfq(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    specifications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_rfq_user_id ON rfq(user_id);
CREATE INDEX idx_rfq_items_rfq_id ON rfq_items(rfq_id);

-- Sample products (optional)
INSERT INTO products (name, description, base_price, category, stock_quantity) VALUES
('Laboratory Beaker Set', 'High-quality borosilicate glass beaker set (50ml to 1000ml)', 1299.00, 'Laboratory Equipment', 50),
('Digital pH Meter', 'Precision digital pH meter with automatic calibration', 2499.00, 'Measuring Instruments', 25),
('Analytical Balance', 'High-precision analytical balance (0.0001g accuracy)', 15999.00, 'Weighing Equipment', 10),
('Microscope Slides', 'Premium glass microscope slides (72 pieces)', 399.00, 'Laboratory Supplies', 100),
('Safety Goggles', 'Chemical-resistant safety goggles with anti-fog coating', 299.00, 'Safety Equipment', 200);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfq_updated_at BEFORE UPDATE ON rfq
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🧪 Test Database Connection Script

Create `myapp/server/test-db-connection.js`:

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✓ Connected to database successfully!');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✓ Database time:', result.rows[0].now);
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n✓ Available tables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    client.release();
    await pool.end();
    console.log('\n✓ Connection test completed successfully!');
  } catch (error) {
    console.error('✗ Database connection error:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Run it:
```bash
cd myapp/server
node test-db-connection.js
```

---

## 📦 Database Backup Strategy

### Automated Backups

**If using Supabase:**
- Automatic daily backups (included)
- Point-in-time recovery available
- Download backups from dashboard

**If using Hostinger:**
- Set up cron job for daily backups
- Store backups off-server

Backup script example:
```bash
#!/bin/bash
# backup-database.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups/database"
mkdir -p $BACKUP_DIR

pg_dump postgresql://user:password@localhost/database > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

---

## 🔄 Migration Checklist

- [ ] Export current database from Supabase (if migrating)
- [ ] Create new database on Hostinger
- [ ] Import schema and data
- [ ] Update backend .env with new DATABASE_URL
- [ ] Test database connection
- [ ] Verify all tables exist
- [ ] Test application functionality
- [ ] Set up automated backups
- [ ] Update documentation with new credentials

---

## ⚠️ Common Issues

**Issue: Connection timeout**
- Check database is running
- Verify firewall allows connection
- Check connection string format

**Issue: SSL certificate error**
- Add `?sslmode=require` or `?ssl=true` to connection string
- Or set `ssl: { rejectUnauthorized: false }` in pool config

**Issue: Permission denied**
- Ensure database user has correct privileges
- Grant necessary permissions:
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE dbname TO username;
  ```

---

**Last Updated:** March 6, 2026
