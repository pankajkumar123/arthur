# 🆘 RENDER DEPLOYMENT FAILURE - COMPLETE FIX

Your deployment is failing. Follow these steps to fix it.

---

## **STEP 1: Identify the Error**

Go to: https://dashboard.render.com → `saiscientifics-api` → **Logs**

Look for the RED ERROR message. Copy it exactly.

Common errors:

```
❌ Cannot find module 'pg'
→ Dependencies not installed properly

❌ Error: listen EADDRINUSE
→ Port conflict, restart needed

❌ DATABASE_URL is undefined
→ Environment variable not set

❌ ECONNREFUSED
→ Database connection failed

❌ Cannot find module '../routes'
→ Wrong root directory
```

---

## **STEP 2: Fresh Start - DELETE OLD SERVICE**

If deployment keeps failing:

1. Go to: https://dashboard.render.com
2. Click your service: `saiscientifics-api`
3. Click **"Settings"** → Scroll down
4. Click: **"Delete Service"**
5. Confirm deletion

This removes bad deployment artifacts.

---

## **STEP 3: Create NEW Web Service**

In Render dashboard:

1. Click **"New +"**
2. Select **"Web Service"**
3. Connect GitHub: `umeshchandracholleti/SS`
4. Fill in:
   ```
   Name:              saiscientifics-api
   Environment:       Node
   Region:            Oregon (or closest)
   Branch:            main
   Root Directory:    myapp/server    ← CRITICAL!
   Build Command:     npm install --production
   Start Command:     npm start
   ```

5. Select **"Free"** plan
6. Click **"Create Web Service"**

---

## **STEP 4: Add Environment Variables (BEFORE deployment starts)**

While service is building, click **"Environment"** tab

Add these 9 variables:

```
DATABASE_URL
postgresql://postgres:YOUR_PASSWORD@HOST:5432/myapp

NODE_ENV
production

PORT
10000

JWT_SECRET
550e8400-e29b-41d4-a716-446655440000

RAZORPAY_KEY_ID
rzp_test_YOUR_ID

RAZORPAY_KEY_SECRET
test_YOUR_SECRET

GMAIL_USER
your-email@gmail.com

GMAIL_PASSWORD
16_char_code

CORS_ORIGIN
https://saiscientifics-api.onrender.com
```

Click **"Save"**

---

## **STEP 5: Watch Deployment**

Click **"Logs"** tab

Watch the build:
```
Building...
npm install ✓
Starting server...
Server running on port 10000 ✓
Server started on port 10000
```

Takes 3-5 minutes.

---

## **STEP 6: Test**

Once "Logs" show `Server started on port 10000`:

Open browser:
```
https://saiscientifics-api.onrender.com/api/health
```

Should show:
```json
{"status":"ok","timestamp":"...","environment":"production","uptime":...}
```

---

## **IF IT FAILS AGAIN:**

### Check 1: Root Directory
```
Settings → Root Directory should be: myapp/server
NOT: myapp or server alone
```

### Check 2: Database URL
```
Should be exactly:
postgresql://postgres:PASSWORD@HOST:5432/myapp

NOT:
postgresql://localhost:5432/myapp (local won't work!)
```

Get correct DATABASE_URL from Render PostgreSQL dashboard.

### Check 3: NODE_ENV
```
Must be: production
NOT: development or anything else
```

### Check 4: All Variables Set
All 9 must be there:
- DATABASE_URL ✓
- NODE_ENV ✓
- PORT ✓
- JWT_SECRET ✓
- RAZORPAY_KEY_ID ✓
- RAZORPAY_KEY_SECRET ✓
- GMAIL_USER ✓
- GMAIL_PASSWORD ✓
- CORS_ORIGIN ✓

---

## **FASTEST FIX (DELETE & RECREATE):**

If stuck:
1. Delete current service
2. Create brand new from scratch
3. Use exact setup from steps 3-4 above
4. Test immediately

This takes ~15 minutes but always works.

---

## **YOUR DEPLOY HOOK:**

```
https://api.render.com/deploy/srv-d6cqpla4d50c73aak3cg?key=AQtQOpGJb5w
```

You can use this to trigger manual deployments later:
```bash
curl -X POST https://api.render.com/deploy/srv-d6cqpla4d50c73aak3cg?key=AQtQOpGJb5w
```

---

## ✅ SUCCESS SIGNS

When deployment works, you'll see:
- ✅ Green "Live" badge in dashboard
- ✅ Logs show "Server started on port 10000"
- ✅ `/api/health` returns JSON
- ✅ `/api/health/db` shows database connection
- ✅ Service uptime shows (not 0 min)

---

## **RIGHT NOW:**

1. **What error shows in logs?** (copy exactly)
2. **Is ROOT DIRECTORY set to `myapp/server`?**
3. **Are all 9 environment variables added?**

Tell me answers and I'll provide exact fix! 💪
