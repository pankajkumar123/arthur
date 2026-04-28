# 🚀 COMPLETE RENDER DEPLOYMENT FIX

## ❌ Current Issue
Getting "Not Found" when accessing `/api/health` on Render

## ✅ Solution (Step-by-Step)

---

## STEP 1: Update Code Locally & Push

I've updated the health endpoint to be simpler.

**Run these commands:**

```bash
cd "c:\SS - Copy"
git add myapp/server/src/index.js
git commit -m "Fix: Simplify health endpoint to not depend on database"
git push origin main
```

The new endpoints are:
 - `/api/health` - Simple health check (always works)
 - `/api/health/db` - Database health check

---

## STEP 2: Go to Render Dashboard

URL: https://dashboard.render.com

Click on your service: `saiscientifics-api`

---

## STEP 3: Verify Service Settings

Click **"Settings"** tab:

Verify EXACTLY:
```
Name:              saiscientifics-api
Environment:       Node ← IMPORTANT!
Region:            Oregon (or your closest)
Branch:            main
Root Directory:    myapp/server  ← CRITICAL!
Build Command:     npm install
Start Command:     npm start
Plan:              Free
```

**If Root Directory is NOT `myapp/server`:**
- Change it to: `myapp/server`
- Click Save
- Render will auto-rebuild

---

## STEP 4: Set Environment Variables

Click **"Environment"** tab

**YOU MUST HAVE EXACTLY THESE 9 VARIABLES:**

```
DATABASE_URL
postgresql://postgres:YOUR_PASSWORD@oregon-postgres.render.com:5432/myapp

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
16_char_app_password

CORS_ORIGIN
https://saiscientifics-api.onrender.com
```

**WHERE TO GET EACH:**

| Variable | Where to Get |
|----------|--------------|
| `YOUR_PASSWORD` | From Render PostgreSQL dashboard |
| `oregon-postgres.render.com` | From Render PostgreSQL dashboard - Connection String |
| `YOUR_ID` | From Razorpay Dashboard → Settings → API Keys |
| `YOUR_SECRET` | From Razorpay Dashboard → Settings → API Keys |
| `16_char_app_password` | From Google Account → Security → App Passwords |

---

## STEP 5: If DATABASE_URL Wrong

**How to find correct DATABASE_URL:**

1. Go to: https://dashboard.render.com
2. Click your PostgreSQL database: `saiscientifics-db`
3. Look for "External Database URL" (NOT Internal)
4. Click the copy button
5. Paste into DATABASE_URL field in Environment

**Format should be:**
```
postgresql://postgres:PASSWORD@HOST:5432/myapp
```

Example:
```
postgresql://postgres:abc123xyz@oregon-postgres.render.com:5432/myapp
```

---

## STEP 6: Save & Redeploy

1. After adding all 9 environment variables, click **"Save"**
2. Render will automatically restart your service
3. Go to **"Logs"** tab
4. Watch for:
   ```
   Building...
   npm install ✓
   Starting server...
   Server running on port 10000 ✓
   ```

This takes 3-5 minutes.

---

## STEP 7: Test the Health Endpoint

Once build completes, open in browser:

```
https://saiscientifics-api.onrender.com/api/health
```

**Should show:**
```json
{"status":"ok","timestamp":"2026-02-21T...","environment":"production","uptime":123.456}
```

---

## STEP 8: If Still "Not Found"

Check the Render logs for error messages:

**Go to Render dashboard → Logs tab**

Common errors and fixes:

### Error: `MODULE NOT FOUND: pg`
**Fix:** Delete service, recreate from scratch

### Error: `ECONNREFUSED localhost:5432`
**Fix:** DATABASE_URL is wrong or points to local machine
- Copy correct DATABASE_URL from Render PostgreSQL
- Paste in Environment variables
- Redeploy

### Error: `Cannot find module '../routes/auth'`
**Fix:** Root Directory is wrong
- Should be: `myapp/server`
- Not: `myapp` or just `server`

### Error: `listen EADDRINUSE`
**Fix:** Click "Manual Deploy" → "Deploy latest commit"

### Error: Shows blank or empty
**Fix:** Port 10000 might be blocked
- Change PORT to `3000`
- Save & rebuild

---

## STEP 9: Test Database Connection

If `/api/health` works, test database:

```
https://saiscientifics-api.onrender.com/api/health/db
```

Should show:
```json
{"status":"ok","timestamp":"2026-02-21T...","database":"connected","environment":"production"}
```

If shows "error", database connection failed:
- Check DATABASE_URL is correct
- Check PostgreSQL database exists
- Try recreating both database and service

---

## STEP 10: Test Full API

Once health endpoints work:

```
https://saiscientifics-api.onrender.com/api/catalog/products
```

Should return list of products (or error if no data)

---

## 🔍 FULL CHECKLIST

- [ ] Code pushed to GitHub (git push done)
- [ ] Root Directory = `myapp/server`
- [ ] Build Command = `npm install`
- [ ] Start Command = `npm start`
- [ ] Environment = Node
- [ ] All 9 environment variables set
- [ ] DATABASE_URL verified correct
- [ ] Manual Deploy clicked
- [ ] Logs show "port 10000"
- [ ] `/api/health` returns JSON
- [ ] `/api/health/db` returns JSON (if DB connected)
- [ ] `/api/catalog/products` returns data

---

## 🆘 STILL NOT WORKING?

**Follow this:**

1. **Screenshot the error** (what exactly shows on page)
2. **Copy Render logs** (last 20 lines)
3. **Tell me:**
   - What error shows?
   - What ROOT DIRECTORY shows?
   - What PORT shows?
   - What DATABASE_URL looks like (hide password)

---

## ✨ AFTER DEPLOYMENT SUCCESS

Once `/api/health` shows `{"status":"ok"...}`:

✅ Your API is live!
✅ Share URL: `https://saiscientifics-api.onrender.com`
✅ Test endpoints work
✅ Ready for live data

---

**Right now:**
1. Push the code changes
2. Go to Render
3. Check Root Directory = `myapp/server`
4. Verify all 9 env variables
5. Click Manual Deploy
6. Wait 3-5 minutes
7. Test `/api/health`

**Then tell me what you see!** 💪
