# Hostinger Node.js Terminal — Quick Command Reference

Copy-paste these commands in **hPanel → Node.js Applications → Terminal**

---

## 📦 Install Dependencies (First Time Only)
```bash
npm install
```
**Takes 2-3 minutes. You may see warnings — that's normal.**

---

## 🗄️ Database Migrations

### Run All Migrations
```bash
npm run db:migrate
```
**Creates 12 tables in your PostgreSQL database.**

Expected output:
```
🚀 Starting database migration...
✓ Orders table initialized
✓ Product table initialized
✓ Payment logs table initialized
...
✓ All migrations completed successfully
```

---

### Seed Sample Data (Optional — For Testing)
```bash
npm run db:seed
```
**Adds 5 sample products so you can test immediately.**

---

## 🚀 Start/Restart Backend

### View Current Status
```bash
npm list
```

### Manually Start (if crashed)
```bash
npm start
```

### View Logs
```bash
tail -f logs/app.log
```
Press **Ctrl+C** to exit.

---

## 🔍 Troubleshoot Database Connection
```bash
# Test connection to PostgreSQL
psql "postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# If connected, type: \dt (lists all tables)
# Type: \q (to exit)
```

---

## ✅ Are Migrations Done?
```bash
# Check if tables exist
npm run db:migrate

# Should output: "All migrations completed successfully"  
# If already run, it will say: "Migration already applied"
```

---

## 🧹 Clean Up Old Files (If Needed)
```bash
# Remove node_modules and reinstall (fixes package conflicts)
rm -rf node_modules package-lock.json
npm install
```

---

## 📋 Environment Variables Check
```bash
# Verify DATABASE_URL is loaded
node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL)"
```

---

**💡 Pro Tip:**  
If anything fails, **check Hostinger Node.js app logs** — not the Terminal output. The logs often have more details.

---

*Commands last tested: March 24, 2026*
