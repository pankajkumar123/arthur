# 📊 DATABASE SETUP - CHOOSE YOUR METHOD

## ✅ STATUS: Servers Running!

```
✅ Backend API: http://localhost:4000
✅ Frontend: http://localhost:5173
⏳ Database Setup: NEXT STEP (choose below)
```

---

## 🔄 DATABASE SETUP OPTIONS

### **RECOMMENDED: Use pgAdmin (Easiest)** ⭐⭐⭐

✔️ **Step 1:** Open browser: **http://localhost:5050**  
✔️ **Step 2:** In left sidebar, right-click **myapp** database  
✔️ **Step 3:** Select **Tools** → **Query Tool**  
✔️ **Step 4:** Open file: `C:\SS - Copy\myapp\database\simple_setup.sql`  
✔️ **Step 5:** Copy-paste all content into Query Tool  
✔️ **Step 6:** Press **F5** to execute  
✔️ **Expected:** See success messages

**Time:** 3 minutes  
**Difficulty:** Easy (GUI based)

---

### **Alternative: Use DBeaver**

1. Open DBeaver
2. Right-click **myapp** → **SQL Editor** → **Open SQL Script**
3. File: `C:\SS - Copy\myapp\database\simple_setup.sql`
4. Click **Execute** button (▶︎)
5. View results in bottom panel

**Time:** 3 minutes  
**Difficulty:** Easy

---

### **CLI (Command Line) - If Above Don't Work**

**File Created:** `C:\SS - Copy\myapp\database\simple_setup.sql`

**Try this command:**
```powershell
cd "C:\SS - Copy\myapp\database"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f simple_setup.sql
```

(When prompted, password is: `postgres`)

**Time:** 2 minutes  
**Difficulty:** Medium

---

## 📋 What The Setup Does

When you execute the SQL script:

✅ **Creates all tables:**
- customers
- products  
- orders
- order_items
- transactions
- invoices
- cart
- system_settings

✅ **Inserts test data:**
- Product: "Test Product - 1 Rupee" (₹1.00)
- Customer: umeshcholleti25@gmail.com / Umesh@12345
- Company: Sai Scientifics with GST 27AAACR5055K1Z0

✅ **Verifies data created:**
- Shows count of test product
- Shows count of test customer
- Shows count of company settings

---

## 🎯 IMMEDIATE NEXT STEP

### **Pick Option 1 or 2 above (pgAdmin or DBeaver)**

It's faster than command line and more visual.

**Do this now:**
1. Open pgAdmin or DBeaver
2. Execute the `simple_setup.sql` file
3. Wait for success messages
4. Come back here

---

## ⏭️ AFTER DATABASE SETUP COMPLETES

Once you see the success messages:

1. **Open your browser** → **http://localhost:5173/Login.html**

2. **Login:**
   ```
   Email: umeshcholleti25@gmail.com
   Password: Umesh@12345
   ```

3. **Begin purchase:**
   - Browse products
   - Find "Test Product - 1 Rupee"
   - Add to cart
   - Checkout with your details
   - Pay with test card: **4111111111111111**
   - Download & Email invoice
   - 🎉

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `simple_setup.sql` | ← Use THIS file (simpler, works better) |
| `PGADMIN_QUICK_SETUP.md` | pgAdmin instructions |
| `setup_test_data.sql` | (Original, has issues) |

---

## 💬 Which Method?

**If you have pgAdmin open:** Use it (easiest)  
**If you have DBeaver open:** Use it (also easy)  
**If neither:** Open pgAdmin at http://localhost:5050

---

**Ready? Execute `simple_setup.sql` now!** ⚡
