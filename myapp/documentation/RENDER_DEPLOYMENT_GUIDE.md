# 🚀 Render Deployment - Complete Step-by-Step Guide

**Time to Live:** 30-45 minutes  
**Difficulty:** Easy  
**Cost:** $0-15/month  
**Date:** February 21, 2026

---

## ⚡ QUICK START (5 Steps)

### Step 1: Push Code to GitHub
```bash
cd "C:\SS - Copy"
git add .
git commit -m "Production release v1.0.0 - ready for deployment"
git push origin main
```

### Step 2: Create Render Account
- Go to https://render.com
- Sign up with **GitHub account** (easiest)
- Authorize GitHub connection
- **Done!** ✅

### Step 3: Create New Web Service
- Click **New +** → **Web Service**
- Select your **SS** repository
- Select branch: **main**
- **Runtime:** Node.js
- **Build Command:** `npm install && npm run migrate`
- **Start Command:** `node src/index.js`

### Step 4: Configure Environment Variables
Copy these into Render dashboard:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@your-host:5432/myapp
JWT_SECRET=your-256-bit-secret-key
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NODE_ENV=production
```

### Step 5: Deploy
- Click **Create Web Service**
- Wait 2-3 minutes for deployment
- **LIVE!** 🎉

---

## 📋 DETAILED STEP-BY-STEP INSTRUCTIONS

### PHASE 1: GitHub & Render Account Setup (5 minutes)

#### Step 1.1: Push Your Code to GitHub

**Option A: If you already have a GitHub repo**
```bash
cd "C:\SS - Copy"
git add -A
git commit -m "Production release v1.0.0 - tested and verified for deployment"
git push origin main
```

**If you have uncommitted changes and want to discard them:**
```bash
git add .
git commit -m "Deployment ready"
git push origin main
```

**If you get an error:**
```bash
# Check git status
git status

# If files are untracked
git add .

# If you need to configure git first
git config --global user.name "Your Name"
git config --global user.email "your.email@gmail.com"

# Then try push again
git push origin main
```

#### Step 1.2: Create Render Account (Free)

1. **Go to:** https://render.com
2. **Click:** "Get Started" or "Sign Up"
3. **Choose:** "Sign up with GitHub"
4. **Authorize:** Allow Render to access your GitHub account
   - Click "Authorize render-ow"
   - GitHub might ask for password confirmation
5. **Complete setup:** Fill in your name and preferences
6. **Done!** ✅ You're logged into Render

---

### PHASE 2: Create PostgreSQL Database (10 minutes)

#### Step 2.1: Create PostgreSQL Instance on Render

1. **In Render Dashboard:**
   - Click **New +** button (top-left)
   - Select **PostgreSQL**

2. **Configure Database:**
   - **Name:** `saiscientifics-db`
   - **Database:** `myapp` (important - matches your app)
   - **User:** `postgres`
   - **Password:** Create a strong password (copy it!)
   - **Region:** Select closest to you (or "Ohio" as default)
   - **Version:** PostgreSQL 15 or higher
   - **Plan:** Free tier (for testing) or pay-as-you-go

3. **Click:** "Create Database"

4. **Wait:** 1-2 minutes for database to initialize

5. **Copy Connection String:**
   - Once created, you'll see an "Internal Database URL"
   - Format: `postgresql://postgres:PASSWORD@hostname:5432/myapp`
   - **Copy this URL** - you'll need it soon

#### Step 2.2: Note Your Database Details

Save these from the Render database page:
```
Database Name: myapp
Username: postgres
Password: [Your Password]
Internal URL: postgresql://postgres:[PASSWORD]@[hostname]:5432/myapp
Hostname: [hostname]
```

**Example Internal URL:**
```
postgresql://postgres:MySecure123@dpg-abcd1234.render.internal:5432/myapp
```

---

### PHASE 3: Create Web Service (Backend API) (10 minutes)

#### Step 3.1: Create New Web Service

1. **In Render Dashboard:**
   - Click **New +** button
   - Select **Web Service**

2. **Connect Repository:**
   - Browse and select your **SS** repository
   - If you don't see it, click "Configure account" and authorize GitHub
   - Select **SS** repo
   - Click **Connect**

3. **Configure Service:**
   - **Name:** `saiscientifics-api`
   - **Region:** Same as database (Ohio or your choice)
   - **Branch:** `main`
   - **Runtime:** `Node.js`
   - **Build Command:** 
     ```
     npm install && npm run migrate
     ```
   - **Start Command:**
     ```
     node src/index.js
     ```
   - **Plan:** Free or Starter (for production, use Starter)

4. **Click:** "Create Web Service"

5. **Wait:** Build starts automatically (2-3 minutes)

#### Step 3.2: Build Output

You should see:
```
Building application...
Installing dependencies...
Running migrations...
Starting server...
```

If build fails, check the logs for errors.

---

### PHASE 4: Configure Environment Variables (5 minutes)

#### Step 4.1: Add Environment Variables

**In Render Web Service Dashboard:**

1. **Go to:** "Environment" tab
2. **Add these variables** (click "+ Add Environment Variable" for each):

```
DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@dpg-xxxxx.render.internal:5432/myapp
JWT_SECRET = your-very-long-random-secret-string-32-chars-min
RAZORPAY_KEY_ID = rzp_test_YOUR_TEST_KEY
RAZORPAY_KEY_SECRET = YOUR_RAZORPAY_SECRET
RAZORPAY_WEBHOOK_SECRET = your_webhook_secret
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-app-specific-password
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_FROM = noreply@saiscientifics.com
NODE_ENV = production
CORS_ORIGIN = https://saiscientifics-api.onrender.com
RATE_LIMIT_MAX_REQUESTS = 100
RATE_LIMIT_WINDOW = 900000
LOG_LEVEL = info
```

#### Step 4.2: Important Notes on Each Variable

**DATABASE_URL:**
- Copy from Render database page
- Format: `postgresql://postgres:[PASSWORD]@[hostname]:5432/myapp`
- Use **Internal Database URL** (not external)

**JWT_SECRET:**
- Generate a random string: Open https://www.uuidgenerator.net/
- Use the generated UUID (or any 32+ character string)
- Example: `a8f3d9c4e2b1f7a9c6e3d1b4f8a5c2e9`

**RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET:**
- Get from: https://dashboard.razorpay.com/app/settings/api-keys
- Use Test Keys initially, switch to Live Keys after testing
- Example Test Keys:
  - Key ID: `rzp_test_1DP5080tfNIybf`
  - Key Secret: `your_test_secret_key`

**EMAIL_PASSWORD (Gmail):**
- Use App Password, NOT regular password
- Generate here: https://myaccount.google.com/apppasswords
- Choose: Mail > Windows Computer
- Copy the 16-character password

**CORS_ORIGIN:**
- Use your Render URL: `https://saiscientifics-api.onrender.com`
- Replace with your actual domain if you have one

#### Step 4.3: Save Environment Variables

1. Click **Save** (button at bottom)
2. Service will automatically restart with new variables
3. Wait 1-2 minutes for restart

---

### PHASE 5: Verify Deployment (5 minutes)

#### Step 5.1: Check Build Logs

1. **In Render Dashboard:**
   - Click your web service
   - Go to **Logs** tab
   - Look for successful messages:
     ```
     Building application...
     npm install completed
     Starting server on port 10000...
     ```

#### Step 5.2: Test Live API

**Get Your Live URL:**
- From Render dashboard, copy the URL at top
- Format: `https://saiscientifics-api.onrender.com`

**Test Health Endpoint:**
```
https://saiscientifics-api.onrender.com/api/health
```

You should see:
```json
{
  "status": "OK",
  "uptime": "123.45",
  "timestamp": "2026-02-21T...",
  "environment": "production"
}
```

**Test in Browser:**
1. Open: https://saiscientifics-api.onrender.com/api/health
2. Should show ✅ green status

**Test User Registration:**
```bash
curl -X POST https://saiscientifics-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "Test@12345"
  }'
```

You should get back a JWT token.

---

### PHASE 6: Connect Frontend (Optional - if hosted separately)

If you're hosting frontend on a separate service:

#### Step 6.1: Update Frontend API URL

In your frontend code (e.g., `api.js`):

```javascript
// OLD:
const API_BASE = 'http://localhost:4000';

// NEW:
const API_BASE = 'https://saiscientifics-api.onrender.com';
```

#### Step 6.2: Deploy Frontend

Push changes and deploy frontend similarly on Render or Vercel/Netlify.

---

## ✅ VERIFICATION CHECKLIST

- [ ] GitHub repository pushed (`main` branch)
- [ ] Render account created with GitHub
- [ ] PostgreSQL database created and running
- [ ] Web service created from repository
- [ ] Build completed successfully (check logs)
- [ ] Environment variables added (8+ variables)
- [ ] Health check responds (GET /api/health → 200)
- [ ] User registration works
- [ ] Login returns JWT token
- [ ] Products endpoint returns data
- [ ] Log files show no errors
- [ ] Response time < 500ms

---

## 🔧 Troubleshooting

### Problem: Build Fails

**Check logs:**
1. Go to service → Logs tab
2. Look for error messages
3. Common issues:
   - `npm install` failed → Check dependencies
   - `npm run migrate` failed → Check DATABASE_URL
   - Port already in use → Render handles this automatically

**Solution:**
```bash
# Redeploy from Render dashboard
# Click "Manual Deploy" → "Deploy latest commit"
```

### Problem: "Cannot find module" error

**Cause:** Missing dependencies

**Solution:**
1. Check `package.json` has all dependencies
2. Rebuild:
   - In Render: Click "Manual Deploy"
   - Wait for rebuild to complete

### Problem: Database Connection Error

**Cause:** Wrong DATABASE_URL format

**Solution:**
1. Copy exact URL from Render database page
2. Verify it includes `:password@` (with colon separator)
3. Check password has no special characters (URL encode if needed)
4. Redeploy service

**Example Format:**
```
postgresql://postgres:MyPassword123@dpg-abc123.render.internal:5432/myapp
```

### Problem: API responds with 500 error

**Check logs:**
1. Go to Logs tab
2. Look for stack trace
3. Common fixes:
   - Missing environment variable
   - Database not initialized
   - Razorpay keys invalid

**Solution:**
```bash
# Verify all env vars are set
# Check database is running
# Restart service: Manual Deploy
```

### Problem: Health check returns 404

**Cause:** Service not fully started

**Solution:**
1. Wait 1-2 minutes after deployment
2. Refresh browser
3. Check logs for startup messages
4. If still failing, check Build Command output

---

## 📊 Monitoring After Deployment

### Daily Checks
- Visit /api/health endpoint
- Check Render dashboard for uptime
- Monitor error logs

### First Week Tasks
1. **Day 1:** Test complete user flow
2. **Day 2:** Verify payment test transaction
3. **Day 3:** Check email notifications
4. **Day 4:** Monitor error logs
5. **Day 5-7:** Performance monitoring

### Enable Render Notifications
1. In Render: Account Settings → Notifications
2. Enable email alerts for:
   - Build failures
   - Service crashes
   - Memory warnings

---

## 🔐 Security After Deployment

### Step 1: Update Razorpay to Live Keys
1. Go to https://dashboard.razorpay.com
2. Get **Live Keys** (not Test Keys)
3. Update environment variables in Render:
   - `RAZORPAY_KEY_ID` → Live key
   - `RAZORPAY_KEY_SECRET` → Live secret
4. Redeploy

### Step 2: Setup Custom Domain (Optional)
1. In Render service settings
2. Go to "Custom Domain"
3. Add your domain (e.g., api.saiscientifics.com)
4. Update DNS records as instructed
5. SSL certificate auto-generated

### Step 3: Enable Database Backups
1. In Render database settings
2. Enable automatic backups
3. Set retention policy (90 days recommended)

---

## 🎉 You're Live!

**Your API is now publicly accessible at:**
```
https://saiscientifics-api.onrender.com
```

**Share this URL with:**
- Frontend developers
- Your team
- Future integrations

---

## 📞 Support Resources

### Render Documentation
- https://render.com/docs
- https://render.com/docs/deploy-node

### Common Issues
- Database connection issues: Check PostgreSQL status
- Build failures: Check build logs in dashboard
- Environment variables: Verify exact variable names

### Monitoring
- Uptime monitoring: Render dashboard
- Error tracking: Application logs
- Performance: Render metrics

---

## ⏮️ Next Steps

### Immediate (After Deployment)
1. ✅ Verify all endpoints work
2. ✅ Test user registration
3. ✅ Test payment flow
4. ✅ Share API URL with team

### Within 24 Hours
1. ✅ Complete user acceptance testing
2. ✅ Verify email notifications sent
3. ✅ Check database backups
4. ✅ Monitor error logs

### Within 1 Week
1. ✅ Switch to Razorpay Live Keys
2. ✅ Setup custom domain
3. ✅ Configure monitoring/alerts
4. ✅ Deploy frontend to production

---

## 🚀 Deployment Complete!

**Congratulations!** Your e-commerce platform is now live on Render! 

**Your live API URL:** `https://saiscientifics-api.onrender.com`  
**Status:** ✅ Production Ready  
**Uptime:** 99.9% SLA included

**Did everything work? Let me know if you need any help!** 🎉

---

**Last Updated:** February 21, 2026  
**Status:** Ready for Production  
**Time to Live:** 30-45 minutes
