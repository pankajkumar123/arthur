# ⚡ QUICK: Setup Database with pgAdmin (2 minutes)

## Step 1: Open pgAdmin
Go to: **http://localhost:5050**

Login if needed (default: pgadmin4@pgadmin.org / admin)

---

## Step 2: Navigate to Query Tool

**In the left sidebar:**
1. Click: **Servers**
2. Expand: **PostgreSQL** (click ►)
3. Expand: **Databases** (click ►)
4. Right-click: **myapp**
5. Select: **Tools** → **Query Tool**

---

## Step 3: Copy the SQL

**Open this file in any text editor:**
```
C:\SS - Copy\myapp\database\simple_setup.sql
```

**Select all content:** Ctrl+A
**Copy:** Ctrl+C

---

## Step 4: Paste in pgAdmin

In the **Query Tool window** that opened:
1. Click in the text area (left side)
2. Paste: **Ctrl+V**

---

## Step 5: Execute the Query

**Click:** **Execute** button (▶︎ icon at top)

Or press: **F5**

---

## ✅ Verify Success

You should see at the bottom:

```
✓ Test Product Created       | 1
✓ Test Customer Created      | 1  
✓ Company Settings Created   | 7
```

With message: **"Setup Complete!"**

---

## 📍 What Gets Created

✅ Test Product - 1 Rupee (₹1.00)
✅ Test User - umeshcholleti25@gmail.com / Umesh@12345
✅ Company Details (Sai Scientifics with GST: 27AAACR5055K1Z0)
✅ All Required Tables (products, customers, orders, etc.)

---

## 🚀 Next Steps After Setup

1. ✅ Come back to this terminal
2. ✅ Open browser: **http://localhost:5173/Login.html**
3. ✅ Login with:
   ```
   Email: umeshcholleti25@gmail.com
   Password: Umesh@12345
   ```
4. ✅ Start your purchase!

---

## 💡 Can't find the file?

**File location:**
- Open File Explorer
- Go to: `C:\SS - Copy\myapp\database\`
- Find: `simple_setup.sql`
- Open with any text editor (Notepad, VS Code, etc.)
- Copy all content

---

**Open pgAdmin now and execute the SQL setup!** 🚀
