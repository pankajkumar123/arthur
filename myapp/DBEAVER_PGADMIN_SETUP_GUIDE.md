# 🗄️ Running SQL Setup Script with DBeaver/pgAdmin

## Option 1: Using DBeaver (Recommended - Easier)

### Step 1: Open DBeaver
- Launch DBeaver on your computer
- Wait for it to fully load (may take 10-15 seconds on first launch)

### Step 2: Connect to PostgreSQL Database

**If you already have a connection:**
- Look for "PostgreSQL" in the left sidebar under "Database" section
- Click to expand and see databases
- Skip to Step 3

**If you DON'T have a connection:**
1. Click **"Database"** menu at top
2. Click **"New Database Connection"**
3. Select **"PostgreSQL"**
4. Click **"Next"**

### Step 3: Connection Settings (If creating new connection)

Fill in these values:
```
Server Host:     localhost
Port:            5432
Database:        postgres  (start with this)
Username:        postgres
Password:        postgres
```

Click **"Test Connection"** to verify
- Should show: ✓ Connected
- Click **"Finish"**

### Step 4: Navigate to 'myapp' Database

In the left sidebar:
1. Expand: **PostgreSQL** → **localhost** → **Databases**
2. Find database: **myapp**
3. Right-click on **myapp**
4. Select: **SQL Editor** → **Open SQL Script**

### Step 5: Open the SQL File

1. In the SQL editor window, click: **File** menu
2. Click: **Open File**
3. Navigate to: `C:\SS - Copy\myapp\database\setup_test_data.sql`
4. Click **"Open"**

**Alternative (Direct):**
1. File Explorer → Navigate to `C:\SS - Copy\myapp\database\`
2. Right-click `setup_test_data.sql`
3. Select: **Open With** → **DBeaver**

### Step 6: Execute the SQL Script

**Method A: Click Execute Button (Easiest)**
1. In the SQL editor, you should see the SQL content
2. Click the **orange "Execute" button** (▶︎ icon) at top
3. Or press: **Ctrl+Enter**

**Method B: Run All Statements**
1. Select all text: **Ctrl+A**
2. Press: **Ctrl+Enter** or click execute

### Step 7: Monitor Execution

In the **"Script Output"** or **"Results"** panel at bottom:
- You'll see status messages
- Look for: ✓ All queries executed successfully
- Red text = errors (if any)

### Step 8: Verify Data Was Created

Run this query to confirm:

```sql
-- Check test product
SELECT id, name, price FROM products WHERE name LIKE '%Test%';

-- Check test user
SELECT id, email, name FROM customers WHERE email = 'umeshcholleti25@gmail.com';

-- Check settings
SELECT key, value FROM system_settings LIMIT 5;
```

**How to run verification:**
1. Highlight the query you want to run
2. Press **Ctrl+Enter**
3. Results appear in panel below

**Expected Results:**
```
✓ Test Product - 1 Rupee found with price 1.00
✓ umeshcholleti25@gmail.com user found
✓ COMPANY_NAME = Sai Scientifics
✓ COMPANY_GST_NUMBER = 27AAACR5055K1Z0
```

---

## Option 2: Using pgAdmin

### Step 1: Open pgAdmin

- Go to: **http://localhost:5050** in your browser
- Or launch pgAdmin application
- Login if prompted (default: pgadmin4@pgadmin.org / admin)

### Step 2: Navigate to Database

In the left sidebar (Object Browser):
1. Expand: **Servers**
2. Expand: **PostgreSQL** (or your server name)
3. Expand: **Databases**
4. Click on: **myapp**

### Step 3: Open Query Tool

**Method A: Right-click Method (Easiest)**
1. Right-click on **myapp** database
2. Click: **Tools** → **Query Tool**

**Method B: Menu Method**
1. With **myapp** selected (highlighted)
2. Click: **Tools** menu at top
3. Click: **Query Tool**

### Step 4: Open SQL File

In the Query Tool window (white text area):

**Method A: Copy-Paste (Easiest)**
1. Open the SQL file in text editor: `C:\SS - Copy\myapp\database\setup_test_data.sql`
2. Select all content: **Ctrl+A**
3. Copy: **Ctrl+C**
4. Go back to pgAdmin Query Tool
5. Click in the text area
6. Paste: **Ctrl+V**

**Method B: Load File**
1. In Query Tool, click: **File** menu (if available)
2. Select: **Open**
3. Navigate to: `setup_test_data.sql`
4. Click **"Open"**

### Step 5: Execute the Query

**Method A: Run All (Recommended)**
1. Select all: **Ctrl+A**
2. Click: **Execute** button (triangle ▶︎ icon)
3. Or press: **F5**

**Method B: Run Selected**
1. Highlight specific query
2. Press: **F5** to execute

### Step 6: View Results

In the bottom panel ("Result" tab):
- You'll see execution status
- Look for: ✓ Query succeeded / Rows affected
- Green checkmarks = success
- Red = errors

### Step 7: Verify Data Created

After all queries complete:

**Run verification query:**
```sql
SELECT 
  'Products' as table_name,
  COUNT(*) as record_count
FROM products
WHERE name LIKE '%Test%'

UNION ALL

SELECT 
  'Customers',
  COUNT(*)
FROM customers
WHERE email = 'umeshcholleti25@gmail.com';
```

Steps to run:
1. Paste the query above into Query Tool
2. Press **F5** (or click Execute)
3. Check results in panel below

**Expected:** Should show 2 rows (Test product + Test customer)

---

## 🎯 What the SQL Script Does

When you execute the script, these things happen:

### ✅ Creates Test Product
```
Product Name: Test Product - 1 Rupee
Price: ₹1.00
Stock: 1000 units
Category: Testing
Status: Available for purchase
```

### ✅ Creates Test User Account
```
Email: umeshcholleti25@gmail.com
Password: Umesh@12345 (already hashed)
Name: Umesh Cholleti
Phone: 9876543210
```

### ✅ Sets Company Details
```
Company Name: Sai Scientifics
Address: Plot No. 123, Test Industrial Area, Bangalore
Phone: +91-9876543210
Email: contactus@saiscientifics.com
GST Number: 27AAACR5055K1Z0
```

### ✅ Validates Database Tables
- All 7 required tables exist
- No errors during setup

---

## ✅ How to Know It Worked

### Signs of Success:
1. ✅ No red error messages
2. ✅ Status shows "Query completed" or "Queries executed"
3. ✅ Test queries show results for product and user
4. ✅ No connection errors

### Signs of Failure:
1. ❌ Red error text in output
2. ❌ "Connection refused" message
3. ❌ "Database does not exist" error (means myapp DB not created)
4. ❌ Timeout or slow response

---

## 🔧 Troubleshooting

### "Cannot connect to PostgreSQL"
**Solution:**
1. Make sure PostgreSQL is running
2. Verify connection details:
   - Host: localhost
   - Port: 5432
   - User: postgres
   - Password: postgres
3. Try restarting PostgreSQL service

### "Database 'myapp' does not exist"
**Solution:**
1. In DBeaver: Navigate to **postgres** database
2. Run this query first:
   ```sql
   CREATE DATABASE myapp;
   ```
3. Then connect to **myapp** and run setup script

### "Permission denied" error
**Solution:**
1. Make sure you're logged in as: **postgres** user
2. Verify password is correct
3. Check PostgreSQL user has CREATE privileges

### Script runs but no data appears
**Solution:**
1. Make sure script completed without errors
2. Refresh the database view (F5 in DBeaver)
3. Check database tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### "Test product not showing in application"
**Solution:**
1. Verify product created:
   ```sql
   SELECT * FROM products WHERE name LIKE '%Test%';
   ```
2. If not found, re-run setup script
3. Restart backend server

---

## 📋 Step-by-Step Quick Reference

### DBeaver Method (5 minutes):
1. Open DBeaver
2. Right-click **myapp** database
3. Select **SQL Editor** → **Open SQL Script**
4. Open file: `setup_test_data.sql`
5. Click **Execute** button (▶︎)
6. Review results panel

### pgAdmin Method (5 minutes):
1. Open pgAdmin (http://localhost:5050)
2. Right-click **myapp** database
3. Select **Tools** → **Query Tool**
4. Paste content from `setup_test_data.sql`
5. Press **F5** to execute
6. Review results panel

---

## ✨ After Setup Complete

Once the script has run successfully:

1. **Verify in Application:**
   - Open: http://localhost:5173/
   - Login: umeshcholleti25@gmail.com / Umesh@12345
   - Browse products → Find "Test Product - 1 Rupee"
   - Should appear with price ₹1.00

2. **Proceed with Purchase:**
   - Follow: `REAL_TIME_PURCHASE_GUIDE.md`
   - Add product to cart
   - Checkout with payment
   - Receive invoice email

---

## 📝 SQL File Location

**File:** `C:\SS - Copy\myapp\database\setup_test_data.sql`

**Contains:** 
- Insert statements for test product
- Insert statements for test user
- Insert statements for company details
- Validation queries
- Total: ~150 lines of SQL

---

## ✅ Verification Checklist

After running the script, run these queries to verify:

```sql
-- Verify test product
SELECT COUNT(*) as product_count FROM products WHERE name LIKE '%Test%';
-- Expected: 1

-- Verify test user
SELECT COUNT(*) as user_count FROM customers 
WHERE email = 'umeshcholleti25@gmail.com';
-- Expected: 1

-- Verify company settings
SELECT COUNT(*) as settings_count FROM system_settings 
WHERE key IN ('COMPANY_NAME', 'COMPANY_GST_NUMBER');
-- Expected: 2 or more

-- Verify all required tables exist
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN 
('customers', 'products', 'cart', 'orders', 'order_items', 'transactions', 'invoices');
-- Expected: 7
```

---

## 🎯 Ready to Proceed?

Once the SQL script has executed successfully:

1. ✅ Close DBeaver/pgAdmin
2. ✅ Make sure backend is running: `npm start` in server folder
3. ✅ Make sure frontend is running: `npm run dev` in myapp folder
4. ✅ Open browser: http://localhost:5173/Login.html
5. ✅ Login with your credentials
6. ✅ Start your purchase journey!

---

**Choose your tool above and execute the script now!**
