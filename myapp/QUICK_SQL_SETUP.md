# ⚡ QUICK: Run SQL Setup in DBeaver or pgAdmin

## 🗄️ Using DBeaver (Simplest)

### 4 Quick Steps:

**1. Open DBeaver**
   - Launch the application
   - Wait for it to load

**2. Get to Query Tool**
   - Left sidebar → Find **PostgreSQL**
   - Expand → Click **myapp** database
   - Right-click **myapp** 
   - Select: **SQL Editor** → **Open SQL Script**

**3. Load the SQL File**
   - In the text editor that opens
   - Menu: **File** → **Open File**
   - Navigate to: `C:\SS - Copy\myapp\database\setup_test_data.sql`
   - Click **Open**

**4. Execute**
   - Click the **orange Play/Execute button** (▶︎) at top
   - Or press: **Ctrl+Enter**
   - Wait for completion
   - Look for: ✓ Success message in output

---

## 🌐 Using pgAdmin (Also Simple)

### 4 Quick Steps:

**1. Open pgAdmin**
   - Go to: `http://localhost:5050`
   - Or launch pgAdmin application

**2. Get to Query Tool**
   - Left sidebar → **Servers** → **PostgreSQL**
   - Find → **Databases** → **myapp**
   - Right-click **myapp**
   - Select: **Tools** → **Query Tool**

**3. Load the SQL File**
   - Text editor window opens
   - Open the SQL file:
     - File Explorer → `C:\SS - Copy\myapp\database\setup_test_data.sql`
     - Copy all content (Ctrl+A, Ctrl+C)
   - Paste in pgAdmin: **Ctrl+V**

**4. Execute**
   - Press: **F5**
   - Or click: **Execute** button (▶︎)
   - Wait for completion
   - Look for: ✓ Success message

---

## ✅ How to Know It Worked

You should see in the output panel:
- ✓ "Query succeeded"
- ✓ "Rows affected" message
- ✓ Green checkmarks (no red errors)

---

## 🧪 Verify It's Working (Optional)

Run this query in the same tool:

```sql
SELECT * FROM products WHERE name LIKE '%Test%';
```

**Expected Result:** One row with product "Test Product - 1 Rupee" priced at 1.00

---

## 🚀 Next Steps After SQL Runs

1. ✅ Close DBeaver/pgAdmin
2. ✅ Ensure backend is running: `npm start` in `myapp\server` folder
3. ✅ Ensure frontend is running: `npm run dev` in `myapp` folder
4. ✅ Open: http://localhost:5173/Login.html
5. ✅ Login:
   ```
   Email: umeshcholleti25@gmail.com
   Password: Umesh@12345
   ```
6. ✅ Start shopping!

---

## 📝 SQL File Location

`C:\SS - Copy\myapp\database\setup_test_data.sql`

---

## ⏱️ Total Time

- DBeaver: ~3-5 minutes
- pgAdmin: ~3-5 minutes
- Both are equally fast

---

**Ready? Pick one tool above and execute the script!** ⚡
