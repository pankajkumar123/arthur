# Hostinger Full-Stack Deployment — Step-by-Step Guide
**Domain:** saiscientificas.com  
**Plan:** Premium (with Node.js + PostgreSQL support)  
**Estimated Time:** 45 minutes  
**Last Updated:** March 24, 2026

---

## 📋 Pre-Deployment Checklist

- [ ] Domain `saiscientificas.com` pointing to Hostinger
- [ ] GitHub repo cloned locally with `hostinger-deploy/` and `hostinger-deploy-backend/` folders
- [ ] Razorpay account created and verified (for live API keys)
- [ ] Gmail account with App Password generated (for email notifications)

---

## Step 1: Verify Node.js Support (2 min)

1. Log in to **hPanel** → https://hpanel.hostinger.com
2. Click **Websites** (left sidebar)
3. Select **saiscientificas.com**
4. Click **Manage** button
5. Scroll down to find **Node.js Applications** section
   - ✅ If you see a **Create Node App** button → You're ready!
   - ❌ If not found → Contact Hostinger support to enable Node.js on your plan

**Save this for later:** The Node.js section URL

---

## Step 2: Upload Frontend to public_html (5 min)

1. In hPanel **Manage** section, find **File Manager**
2. Click **File Manager** → opens web-based file explorer
3. Navigate to **public_html** folder
4. **Delete** any default `index.html` files (keep folder empty)
5. From your PC, go to `c:\SS\hostinger-deploy\`
6. Upload these 6 files/folders:
   ```
   ✓ index.html
   ✓ .htaccess
   ✓ _redirects
   ✓ assets/         (entire folder with CSS + JS)
   ✓ vite.svg
   ```

**Verify:** After upload, visit https://saiscientificas.com in browser
- Should show Sai Scientifics homepage
- If blank/404 → htaccess might be hidden; refresh cache (Ctrl+Shift+Del)

---

## Step 3: Create Node.js Application (5 min)

1. In hPanel → **Node.js Applications** section
2. Click **Create Node App** button
3. Fill in:
   ```
   App Name:           backend
   Application Root:   Leave default (usually /home/u123456789/nodejs/backend)
   Startup File:       src/index.js
   Node.js Version:    18.x or 20.x
   Port:               4000
   ```
4. Click **Create**

**Save these values:**
- App root path (you'll need it for Step 4)
- Port: `4000`

---

## Step 4: Upload Backend Files (5 min)

1. In hPanel → **Node.js Applications** section → find your **backend** app
2. Click **File Manager** button (or SSH terminal option)
3. In the File Manager window, navigate to the **Application Root** folder
4. Delete everything except `package-lock.json` if present
5. From your PC, open `c:\SS\hostinger-deploy-backend\`
6. Select ALL files and folders:
   ```
   ✓ src/
   ✓ scripts/
   ✓ tests/
   ✓ uploads/
   ✓ package.json
   ✓ package-lock.json
   ✓ README.md
   ✓ .env.template
   ```
7. Upload to Application Root

**Verify:** After upload, check that folder structure shows:
```
/nodejs/backend/
├── src/
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── scripts/
├── package.json
└── .env.template
```

---

## Step 5: Set Environment Variables (10 min)

1. In hPanel → **Node.js Applications** → Click your **backend** app name
2. Scroll down to **Environment Variables** section
3. Click **Add Variable** for each line below and paste:

### Environment Variables Block (Copy-Paste These)

```
PORT                     4000
NODE_ENV                 production
FRONTEND_URL             https://saiscientificas.com
CORS_ORIGIN              https://saiscientificas.com

DATABASE_URL             [FILL LATER in Step 6]

JWT_SECRET               [GENERATE: See command below]
JWT_EXPIRES_IN           7d
SESSION_SECRET           [GENERATE: See command below]

RAZORPAY_KEY_ID          rzp_live_[GET FROM RAZORPAY DASHBOARD]
RAZORPAY_KEY_SECRET      [GET FROM RAZORPAY DASHBOARD]
RAZORPAY_WEBHOOK_SECRET  [GET FROM RAZORPAY DASHBOARD]

EMAIL_HOST               smtp.gmail.com
EMAIL_PORT               587
EMAIL_USER               sales@saiscientificas.com
EMAIL_PASSWORD           [GENERATE: Gmail App Password]
EMAIL_FROM               Sai Scientificas <sales@saiscientificas.com>

COMPANY_NAME             Sai Scientificas
COMPANY_EMAIL            sales@saiscientificas.com
COMPANY_PHONE            +91-XXXX-XXXXX
COMPANY_ADDRESS          Your Address Here
COMPANY_GSTIN            07XXXXX1234X1ZX

UPLOAD_DIR               uploads
MAX_FILE_SIZE            5242880

RATE_LIMIT_WINDOW_MS     900000
RATE_LIMIT_MAX_REQUESTS  100
```

### How to Generate Secrets

**Generate JWT_SECRET and SESSION_SECRET:**
```powershell
# Run in PowerShell on your local PC
node -e "console.log('JWT_SECRET: ' + require('crypto').randomBytes(32).toString('hex')); console.log('SESSION_SECRET: ' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output into Hostinger panel for both `JWT_SECRET` and `SESSION_SECRET`.

---

## Step 6: Create PostgreSQL Database (5 min)

1. In hPanel → **Databases** (left sidebar)
2. Click **PostgreSQL** tab
3. Click **Create Database** button
4. Fill in:
   ```
   Database Name:  saiscientificas_db
   Database User:  saiscientificas_usr
   Password:       [GENERATE STRONG PASSWORD - 20+ chars]
   ```
5. Click **Create**

**After creation, you'll see:**
```
Host:       localhost or s123456.hostinger.com (note this)
Port:       5432
Database:   saiscientificas_db
User:       saiscientificas_usr
Password:   [your password]
```

**Build connection string:**
```
DATABASE_URL=postgresql://saiscientificas_usr:[PASSWORD]@[HOST]:5432/saiscientificas_db
```

**Example:**
```
DATABASE_URL=postgresql://saiscientificas_usr:MySuperSecure123@s123456.hostinger.com:5432/saiscientificas_db
```

6. Copy the full connection string
7. Go back to Step 5 → **Node.js Apps → Environment Variables**
8. Edit the `DATABASE_URL` variable and paste the connection string

---

## Step 7: Install Dependencies & Run Migrations (5 min)

1. In hPanel → **Node.js Applications** → Your **backend** app
2. Click **Terminal** button (or **SSH terminal** if available)
3. You should be in `/home/u123456789/nodejs/backend/` directory

**Run npm install:**
```bash
npm install
```
Wait for ~2-3 minutes as it installs 100+ packages.

**Run database migrations:**
```bash
npm run db:migrate
```

Expected output:
```
🚀 Starting database migration...
✓ Orders table initialized
✓ Payment logs table initialized
✓ All migrations completed successfully
```

**If you get errors:**
- `CONNECTION REFUSED` → DATABASE_URL is wrong (check Step 6)
- `FATAL: role does not exist` → Database user wasn't created (re-do Step 6)
- `Permission denied` → Hostinger database user permissions (contact support)

**Seed sample data (optional):**
```bash
npm run db:seed
```

This adds 5 sample products for testing.

---

## Step 8: Restart Node.js App & Test (2 min)

1. In hPanel → **Node.js Applications** → Your **backend** app
2. Find **Status** indicator (should show 🟢 Running)
3. If not running, click **Start** button
4. If already running, click **Restart** button

**Test the backend:**
Open in browser:
```
https://saiscientificas.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-24T10:30:00Z",
  "environment": "production"
}
```

**If you get 502 Bad Gateway:**
- Node app didn't start → Check environment variables (Step 5)
- Missing DATABASE_URL → Restart after adding it

---

## Step 9: Configure Razorpay Webhook (3 min)

1. Go to **Razorpay Dashboard** → Settings → **Webhooks**
2. Click **Add New Webhook**
3. Fill in:
   ```
   Webhook URL:     https://saiscientificas.com/api/payment/webhook
   Events:          ✓ payment.authorized
                    ✓ payment.failed
                    ✓ payment.captured
   Active:          YES
   ```
4. Click **Create Webhook**
5. Copy **Secret** value → Add to Hostinger:
   - Go back to hPanel → Node.js → Environment Variables
   - Update `RAZORPAY_WEBHOOK_SECRET` with this value
   - Click **Restart** app

---

## Step 10: Final Smoke Test (5 min)

### Test Frontend
1. Visit https://saiscientificas.com
2. Check:
   - [ ] Homepage loads with products
   - [ ] Navigation menu works
   - [ ] Can click "Add to Cart"
   - [ ] Cart page shows items

### Test Backend API
1. https://saiscientificas.com/api/health → 200 OK
2. https://saiscientificas.com/api/products → should return products array

### Test Authentication
1. Visit https://saiscientificas.com
2. Click **Register**
3. Fill in:
   ```
   Email:    test@example.com
   Password: TestPass123!
   ```
4. Check email for confirmation link (may take 1-2 min)

### Test Payment (Optional)
1. Add product to cart
2. Go to checkout
3. Enter test Razorpay card:
   ```
   Card:  4111 1111 1111 1111
   Exp:   12/25
   CVV:   123
   ```
4. Should see "Payment Successful" message

---

## 🎯 Success Checklist

- [ ] Frontend loads at https://saiscientificas.com
- [ ] Backend responds to `/api/health`
- [ ] Can register new user
- [ ] Products visible on homepage
- [ ] Add to cart works
- [ ] Can reach checkout page
- [ ] Backend logs show incoming requests (in Terminal)

---

## ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **404 Frontend** | Clear browser cache (Ctrl+Shift+Del), check .htaccess in public_html |
| **502 Backend** | Restart Node app, check DATABASE_URL in env vars |
| **Can't send emails** | Gmail App Password wrong; regenerate at myaccount.google.com/apppasswords |
| **Payment webhook fails** | Webhook URL must be HTTPS; check RAZORPAY_WEBHOOK_SECRET |
| **Slow page loads** | Node app may be sleeping; click app in hPanel to wake it |
| **Database connection refused** | DATABASE_URL format wrong; test with: `psql "connection_string"` |

---

## 📞 Need Help?

- **Frontend issues:** Check browser console (F12 → Console tab)
- **Backend issues:** Check Node app terminal logs in hPanel
- **Database issues:** Use hPanel → Databases → test connection tool
- **Payment issues:** Test webhook URL with Razorpay dashboard → Webhooks → Test

---

## ✅ Deployment Complete! 🚀

Your full-stack app is now live at **https://saiscientificas.com** with:
- ✅ Frontend (React + Vite)
- ✅ Backend (Node.js + Express)
- ✅ Database (PostgreSQL)
- ✅ Payments (Razorpay)
- ✅ Email notifications

**Next steps:**
1. Monitor backend logs in Hostinger Node.js panel
2. Check email delivery in Gmail sent folder
3. Test with real Razorpay live keys (after KYC)
4. Set up monitoring/alerting (optional)

---

*Last tested: March 24, 2026*
