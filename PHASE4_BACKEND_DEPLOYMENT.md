# Phase 4: Backend Deployment to Render

## 📋 Pre-Deployment Checklist

Before deploying to Render, verify everything is ready:

### Backend Repository
- [ ] Code pushed to GitHub `SS-Backend` repository
- [ ] `package.json` has correct `start` script: `"start": "node src/index.js"`
- [ ] `.gitignore` excludes sensitive files (`.env`, `.env.local`, `node_modules/`)
- [ ] No hardcoded secrets in code

### Environment Variables Ready
- [ ] `DATABASE_URL` from Supabase
- [ ] `SUPABASE_URL` from Supabase
- [ ] `SUPABASE_ANON_KEY` from Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` from Supabase
- [ ] `JWT_SECRET` generated (32+ chars)
- [ ] Optional: Email, Razorpay, Twilio credentials

### Supabase Database
- [ ] Supabase project active
- [ ] 12 tables created (run `npm run db:migrate` if not)
- [ ] Test connection works: `node test-supabase.js`

### Local Testing
- [ ] Backend runs locally: `npm run dev`
- [ ] Health check works: `http://localhost:4000/api/health`
- [ ] Database health check works: `http://localhost:4000/api/health/db`
- [ ] No console errors

---

## 🚀 Deployment Process (15-20 minutes)

### Step 1: Access Render (2 min)
1. Go to [https://render.com](https://render.com)
2. Sign up or log in with GitHub
3. Verify email if needed

### Step 2: Create Web Service (3 min)
1. Click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Authorize GitHub access
4. Select **`SS-Backend`** repository
5. Click **"Connect"**

### Step 3: Configure Service (5 min)

**Basic Settings:**
```
Name: saiscientifics-backend
Region: Oregon (US West)
Branch: main
Runtime: Node
```

**Build & Deploy:**
```
Build Command: npm install
Start Command: npm start
```

**Plan:**
```
Instance Type: Free (for testing)
```

### Step 4: Add Environment Variables (8 min)

Click **"Advanced"** → Add these variables:

**Essential (Required):**
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
JWT_SECRET=your-32-char-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

> **Note**: Update `CORS_ORIGIN` after deploying frontend

**Optional (if configured):**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sales@saiscientifics.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Sai Scientifics <sales@saiscientifics.com>

RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 5: Deploy! (2 min)
1. Click **"Create Web Service"**
2. Wait for build (2-4 minutes)
3. Watch logs for errors

**Expected output:**
```
==> Cloning from GitHub...
==> Running 'npm install'
✓ Build successful
==> Starting service with 'npm start'
✓ Service is live!
```

### Step 6: Verify Deployment (2 min)

Your backend URL: `https://saiscientifics-backend.onrender.com`

**Test endpoints:**

1. **Root endpoint:**
   ```
   https://saiscientifics-backend.onrender.com/
   ```
   Should return API info

2. **Health check:**
   ```
   https://saiscientifics-backend.onrender.com/api/health
   ```
   Should return: `{"status": "ok", ...}`

3. **Database health:**
   ```
   https://saiscientifics-backend.onrender.com/api/health/db
   ```
   Should return: `{"status": "ok", "database": "connected", ...}`

---

## ✅ Post-Deployment Verification

### Test in Browser
Open these URLs in your browser:
- https://saiscientifics-backend.onrender.com/api/health
- https://saiscientifics-backend.onrender.com/api/health/db

### Test with cURL (PowerShell)
```powershell
# Health check
curl https://saiscientifics-backend.onrender.com/api/health

# Database check
curl https://saiscientifics-backend.onrender.com/api/health/db

# Test API endpoint (should fail without auth, which is expected)
curl https://saiscientifics-backend.onrender.com/api/products
```

### Check Render Dashboard
1. Go to Render Dashboard
2. Click your service
3. Check **Logs** tab for:
   - ✅ "Database connected successfully"
   - ✅ "Server running on port 4000"
   - ✅ No error messages

### Verify Metrics
1. Click **Metrics** tab
2. Should show:
   - CPU usage < 50%
   - Memory usage < 200MB
   - Request count growing

---

## 🎯 What You Should Have Now

After successful deployment:

- ✅ Backend running on Render
- ✅ Live URL: `https://saiscientifics-backend.onrender.com`
- ✅ Database connected to Supabase
- ✅ Health checks passing
- ✅ Logs showing no errors
- ✅ Auto-deploy on GitHub push enabled

**Copy your backend URL** - you'll need it for Phase 5!

---

## 🐛 Troubleshooting

### Build Failed
**Error**: `npm ERR! Missing script: "start"`
**Fix**: Check `package.json` has `"start": "node src/index.js"`

### Service Won't Start
**Error**: `Error: listen EADDRINUSE`
**Fix**: Code should use `process.env.PORT`, not hardcoded port

### Database Connection Failed
**Error**: `getaddrinfo ENOTFOUND`
**Fix**: 
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Test locally: `node test-supabase.js`

### 503 Errors
**Cause**: Free tier spins down after 15 min
**Solution**: First request after idle takes 30-60 sec to wake

### Environment Variable Not Working
**Fix**:
- Check spelling matches code
- No extra spaces in values
- Click "Save Changes"
- Service auto-redeploys

---

## 💰 Free Tier Limitations

- ✅ 750 hours/month (enough for 1 service)
- ✅ Automatic HTTPS
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512 MB RAM limit

**Upgrade to Starter ($7/mo) for:**
- Always-on service
- No spin-down delays
- Better performance

---

## 🔄 Continuous Deployment

Render automatically redeploys when you push to GitHub:

```powershell
# Make changes
cd C:\SS\myapp\server
# Edit files...

# Commit and push
git add .
git commit -m "Update API endpoint"
git push origin main

# Render detects push and auto-deploys
# Check logs in Render Dashboard
```

---

## 📝 Save This Information

**Backend URL**: `https://saiscientifics-backend.onrender.com`

You'll need this for:
- Phase 5: Frontend deployment (set as `VITE_API_URL`)
- Testing frontend-backend integration
- API documentation
- Demo video

---

## ➡️ Next Steps

1. ✅ **Phase 4 Complete**: Backend deployed to Render
2. 🔜 **Phase 5**: Deploy frontend to Netlify
   - Set `VITE_API_URL` to your Render backend URL
   - Deploy React app
   - Test full integration

---

## 📞 Support

**Render Issues:**
- Community: [community.render.com](https://community.render.com)
- Docs: [render.com/docs](https://render.com/docs)
- Status: [status.render.com](https://status.render.com)

**Backend Issues:**
- Check logs in Render Dashboard
- Test locally: `npm run dev`
- Verify database: `node test-supabase.js`

---

**Ready for Phase 5? Let's deploy the frontend! 🚀**
