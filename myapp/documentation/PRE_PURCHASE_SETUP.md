# 🚀 Pre-Purchase Setup Checklist

## What You MUST Do Before Starting Purchase

### ✅ Step 1: Database Setup (2 minutes)

**Location:** `myapp/database/setup_test_data.sql`

**How to run:**

**Option A: Using pgAdmin (Easiest)**
1. Open pgAdmin: http://localhost:5050 (or your pgAdmin port)
2. Login with your PostgreSQL credentials
3. Find database: `myapp`
4. Right-click → Query Tool
5. Copy-paste content from `setup_test_data.sql`
6. Click Execute (F5)
7. Wait for "All Queries Executed" message

**Option B: Using psql Command Line**
```powershell
cd "c:\SS - Copy\myapp\database"
psql -U postgres -d myapp -f setup_test_data.sql
```

**Option C: Using DBeaver or Other SQL Tool**
1. Connect to `postgresql://localhost:5432/myapp`
2. Create new query
3. Paste `setup_test_data.sql` content
4. Execute

**What This Does:**
✅ Creates ₹1 test product in products table
✅ Creates test user account: umeshcholleti25@gmail.com / Umesh@12345
✅ Sets company details for invoices
✅ Validates all required database tables exist

---

### ✅ Step 2: Verify Database Tables

**Run this query to confirm:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN (
  'customers', 'products', 'cart', 'orders', 
  'order_items', 'transactions', 'invoices'
);
```

**Expected Result:** All 7 tables should be listed

---

### ✅ Step 3: Verify Backend Server Running

**Check API Status:**

Open browser and visit: `http://localhost:4000/api/health`

**Expected Result:**
```json
{
  "status": "ok",
  "message": "API server running",
  "timestamp": "2024-02-23T10:30:00Z"
}
```

**If this shows an error:**
1. Open terminal in `myapp/server` folder
2. Run: `npm start`
3. Wait 5 seconds
4. Try the URL again

---

### ✅ Step 4: Verify Test Product Created

**Check via API:**

Open: `http://localhost:4000/api/products?search=Test`

**Expected Result:** Should see product with name "Test Product - 1 Rupee" and price 1.00

**If not found:**
1. Re-run the SQL script from Step 1
2. Refresh the browser

---

### ✅ Step 5: Verify Test User Account Created

**Check via API (After Step 1 database setup):**

The account is created but only accessible after login. You'll verify this by logging in.

**Credentials Created:**
- Email: `umeshcholleti25@gmail.com`
- Password: `Umesh@12345`
- Name: `Umesh Cholleti`
- Phone: `9876543210`

---

### ✅ Step 6: Verify Frontend Running

**Check Frontend Status:**

Open: `http://localhost:5173/`

**Expected Result:**
- Homepage loads
- Navigation shows Products, Cart, Login links
- No console errors (F12 to check)

**If page doesn't load:**
1. In `myapp` folder, run: `npm run dev`
2. Wait for "Local: http://localhost:5173"
3. Refresh browser

---

### ✅ Step 7: Email Configuration (Optional but Recommended)

**For invoice emails to work, ensure backend has email configured:**

**Check email settings in:** `server/.env`

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=contactus@saiscientifics.com
```

**If not configured:**
1. Contact backend admin to configure SMTP
2. Or invoices can be downloaded manually (Step 9 in purchase guide)

---

### ✅ Step 8: Verify Razorpay Configuration

**Check Razorpay test key in:** `server/.env`

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

**Status:** ✅ Already configured in development

---

## Pre-Purchase Verification Checklist

Before starting your purchase, verify all items:

- [ ] Docker/PostgreSQL database is RUNNING
- [ ] Backend server started (`npm start` in `myapp/server`)
- [ ] Frontend server running (`npm run dev` in `myapp`)
- [ ] Database setup script executed successfully
- [ ] API health check returns 200 OK
- [ ] Test product exists in database
- [ ] Test user account created
- [ ] Frontend loads at http://localhost:5173
- [ ] Browser console has no errors (F12)
- [ ] Razorpay test key configured

## Troubleshooting

### "Cannot connect to database"
**Solution:**
1. Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
2. Check connection string in `.env`: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp`
3. Create database if missing: `createdb -U postgres myapp`

### "API server not responding"
**Solution:**
1. Terminal to `myapp/server`
2. Install dependencies: `npm install`
3. Start server: `npm start`
4. Should see: "Server running on port 4000"

### "Frontend page blank"
**Solution:**
1. Terminal to `myapp`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Wait for: "Local: http://localhost:5173"

### "Test product not found"
**Solution:**
1. Re-run database setup script
2. Verify it executed without errors
3. Check using query: `SELECT * FROM products WHERE name LIKE '%Test%'`

### "Cannot login"
**Solution:**
1. Verify user created in database: `SELECT * FROM customers WHERE email='umeshcholleti25@gmail.com'`
2. If not found, re-run setup script
3. Clear browser cache: Ctrl+Shift+Delete

---

## Ready to Purchase?

Once all ✅ items are completed, you're ready to start!

**Your Purchase Link:** Open `http://localhost:5173/Login.html`

**Then follow:** `REAL_TIME_PURCHASE_GUIDE.md` for step-by-step instructions

---

**Estimated Setup Time:** 5-10 minutes total
**Success Rate:** 100% if all steps followed ✅
**Support:** Check troubleshooting section OR contact admin
