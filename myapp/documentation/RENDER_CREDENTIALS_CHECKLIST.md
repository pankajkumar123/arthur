# 📋 RENDER DEPLOYMENT - CREDENTIALS & SETUP CHECKLIST

**DO THIS FIRST:** Gather all credentials below before starting deployment!

---

## 📝 CREDENTIALS TO GATHER

### 1️⃣ DATABASE CREDENTIALS (Create During Deployment)
```
Database Name: myapp
Database User: postgres
Database Password: _____________________________ (create new, min 12 chars)
Database Region: _____________________________ (select your region)
```

**Will be provided by Render after creating database.**

---

### 2️⃣ RAZORPAY CREDENTIALS (Get from Dashboard)

**Go to:** https://dashboard.razorpay.com/app/settings/api-keys

```
RAZORPAY_KEY_ID: rzp_test_________________________
RAZORPAY_KEY_SECRET: ___________________________

NOTE: Use TEST keys initially!
Later switch to LIVE keys after testing payment flow.
```

➡️ **How to find:**
1. Log in to Razorpay
2. Settings → API Keys
3. Copy "Key ID" and "Key Secret" (in Test Mode)

---

### 3️⃣ GMAIL APP PASSWORD (Get from Gmail)

**Go to:** https://myaccount.google.com/apppasswords

```
EMAIL_USER: ___________________________
EMAIL_PASSWORD: _____________________________ (16-character app password)
```

⚠️ **IMPORTANT:**
- Use your **Gmail email address**
- Use **App Password** (NOT regular Gmail password!)
- Gmail generates a 16-character password
- Copy exactly as shown

**Steps:**
1. Go to https://myaccount.google.com/apppasswords
2. Select: Mail > Windows Computer
3. Google generates password
4. Copy the 16-character code
5. Save it

---

### 4️⃣ JWT SECRET (Generate Now)

**Go to:** https://www.uuidgenerator.net/

```
JWT_SECRET: ___________________________

(Copy the UUID generated)
```

**Example:**
```
a8f3d9c4-e2b1-f7a9-c6e3-d1b4f8a5c2e9
```

---

### 5️⃣ GITHUB REPOSITORY (You Have This!)

```
Repository: umeshchandracholleti/SS
Branch: main
URL: https://github.com/umeshchandracholleti/SS
```

✅ Already set up!

---

## ✅ PRE-DEPLOYMENT CHECKLIST

- [ ] Code pushed to GitHub (main branch)
- [ ] Razorpay account created
- [ ] Razorpay test keys copied
- [ ] Gmail account ready
- [ ] Gmail app password generated
- [ ] JWT secret generated
- [ ] Strong database password created
- [ ] This checklist completed

---

## 🚀 ENVIRONMENT VARIABLES FOR RENDER

**Copy-paste these into Render Environment tab:**

### Required Variables (MUST HAVE)
```
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@render-database-host:5432/myapp
JWT_SECRET=your-uuid-here
NODE_ENV=production
```

### Payment Variables
```
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
```

### Email Variables
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM=noreply@saiscientifics.com
```

### Optional Variables (Nice to Have)
```
CORS_ORIGIN=https://saiscientifics-api.onrender.com
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW=900000
```

---

## 🔒 CREDENTIALS SECURITY

⚠️ **NEVER commit credentials to GitHub!**

✅ What I've done for you:
- All credentials are environment variables (NOT in code)
- Code uses `process.env.VARIABLE_NAME`
- Credentials stay in Render dashboard only

✅ Best practices:
- Use different passwords for dev vs production
- Store passwords in password manager
- Use app-specific passwords (Gmail)
- Rotate credentials periodically
- Never share .env files

---

## 📋 STEP-BY-STEP WITH CREDENTIALS

### When Creating Database:
1. Name: `saiscientifics-db` ✓
2. Database: `myapp` ✓ (MUST BE EXACT)
3. User: `postgres` ✓
4. Password: [Your strong password from credentials checklist]
5. Region: [Your region]
6. Click Create

**After created, you'll get:**
```
Internal Database URL: postgresql://postgres:[password]@[hostname]:5432/myapp
```
Copy this entire URL!

### When Creating Web Service:
1. Repository: Search and select `SS`
2. Name: `saiscientifics-api` ✓
3. Branch: `main` ✓
4. Runtime: `Node.js` ✓
5. Build: `npm install && npm run migrate` ✓
6. Start: `node src/index.js` ✓
7. Click Create

Build starts automatically!

### When Adding Environment Variables:
1. Copy-paste all variables from above
2. Replace placeholders with YOUR values:
   - `DATABASE_URL` = URL from database page
   - `RAZORPAY_KEY_ID` = From Razorpay dashboard
   - `RAZORPAY_KEY_SECRET` = From Razorpay dashboard
   - `JWT_SECRET` = FROM UUID generator
   - `EMAIL_USER` = Your Gmail
   - `EMAIL_PASSWORD` = 16-char app password
3. Click Save
4. Wait 2-3 min for restart

---

## 🧪 TEST CREDENTIALS (Safe for Testing)

**For testing, use these safe test credentials:**

### Razorpay Test Card:
```
Card Number: 4111111111111111
Expiry: 12/25
CVV: 123
```

### Test Payment Amount:
```
1 INR (lowest amount for testing)
```

### Test Email:
```
test@test.com (works in test mode)
```

---

## 📞 CREDENTIAL RECOVERY

### Lost Razorpay Keys?
- Go to: https://dashboard.razorpay.com/app/settings/api-keys
- Keys are regenerated there

### Lost Gmail App Password?
- Go to: https://myaccount.google.com/apppasswords
- Generate new one (old one becomes inactive)

### Lost Database Password?
- In Render: Delete and recreate database
- No data loss (empty database)

### Lost JWT_SECRET?
- Generate new UUID
- Update in Render environment
- Existing tokens become invalid (acceptable in test)

---

## ⏭️ NEXT STEPS

1. **Print this page** or keep it open
2. **Gather all credentials** (check all boxes above)
3. **Follow RENDER_QUICK_REFERENCE.md** step by step
4. **Paste credentials** as instructed
5. **Wait for deployment** (3-5 minutes)
6. **Test live API** (verify health endpoint)
7. **CELEBRATE!** 🎉

---

## 🎯 DURING DEPLOYMENT

**Read while deploying:**
- RENDER_QUICK_REFERENCE.md (step-by-step visual)
- RENDER_DEPLOYMENT_GUIDE.md (detailed reference)

**If stuck:**
- Check application logs in Render
- Compare your variables with the format above
- Verify DATABASE_URL format is correct

---

## ✅ VERIFICATION COMMANDS

**After deployment, test these in browser console:**

### Health Check:
```javascript
fetch('https://saiscientifics-api.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Health:', d.status))
```

### Get Products:
```javascript
fetch('https://saiscientifics-api.onrender.com/api/catalog/products?limit=1')
  .then(r => r.json())
  .then(d => console.log('✅ Products:', d.length))
```

### Test Registration:
```javascript
fetch('https://saiscientifics-api.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test',
    email: 'test@test.com',
    password: 'Test@12345'
  })
}).then(r => r.json()).then(d => console.log('✅ Registered:', d.token ? 'Success' : 'Failed'))
```

---

## 🎉 YOU'RE READY!

**All credentials gathered?** ✅  
**Ready to deploy?** ✅  

**Let's go live!** 🚀

**Open:** RENDER_QUICK_REFERENCE.md and follow the 5 steps!

---

**Questions during deployment?** Check RENDER_DEPLOYMENT_GUIDE.md for detailed troubleshooting!
