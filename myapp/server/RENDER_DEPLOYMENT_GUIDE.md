# Render Deployment Guide - SS-Backend

Complete step-by-step guide to deploy the Sai Scientifics backend API to Render.

## 📋 Prerequisites

Before you begin:
- ✅ GitHub account with SS-Backend repository
- ✅ Render account (sign up at [render.com](https://render.com))
- ✅ Supabase credentials ready
- ✅ Backend code tested locally

## 🚀 Deployment Steps

### Step 1: Sign Up / Log In to Render

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

---

### Step 2: Connect GitHub Repository

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Authorize Render to access your GitHub account
4. Find and select **`SS-Backend`** repository
5. Click **"Connect"**

---

### Step 3: Configure Web Service

Fill in the following settings:

**Basic Configuration:**
- **Name**: `saiscientifics-backend` (or your preferred name)
- **Region**: `Oregon (US West)` (or closest to you)
- **Branch**: `main`
- **Root Directory**: Leave blank (or `.` if needed)
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- **Plan**: `Free` (for testing, upgrade to Starter for production)

---

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables one by one:

#### Essential Variables

```env
NODE_ENV=production
PORT=4000
```

#### Database (Supabase)
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Get these from**: Supabase Project Settings → API

#### Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-random-string
JWT_EXPIRES_IN=7d
```

> **Generate JWT_SECRET**: Use `openssl rand -base64 32` or random string generator

#### CORS
```env
CORS_ORIGIN=https://your-frontend-url.netlify.app
```

> **Note**: Update this after deploying frontend in Phase 5

#### Email (Optional - Gmail SMTP)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sales@saiscientifics.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=Sai Scientifics <sales@saiscientifics.com>
```

> **Gmail App Password**: Google Account → Security → App Passwords

#### Payments (Optional - Razorpay)
```env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> **Get from**: Razorpay Dashboard → Settings → API Keys

#### SMS/WhatsApp (Optional - Twilio)
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

> **Get from**: Twilio Console → Account Info

---

### Step 5: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Render will start building your app
3. Wait for build to complete (2-5 minutes)
4. Check the logs for any errors

**Build Process:**
```
==> Cloning from GitHub...
==> Running build command: npm install
==> Build completed successfully
==> Starting service with: npm start
==> Service is live!
```

---

### Step 6: Get Your Backend URL

After successful deployment:

1. Your backend URL will be: `https://saiscientifics-backend.onrender.com`
2. Copy this URL - you'll need it for frontend deployment
3. Test the endpoint: `https://saiscientifics-backend.onrender.com/`

**Expected Response:**
```json
{
  "success": true,
  "message": "Sai Scientifics API Server",
  "version": "1.0.0",
  "timestamp": "2026-03-01T..."
}
```

---

### Step 7: Verify Deployment

Test these endpoints:

#### Health Check
```bash
curl https://saiscientifics-backend.onrender.com/
```

#### Database Connection
```bash
curl https://saiscientifics-backend.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-03-01T..."
}
```

---

## 🔧 Post-Deployment Configuration

### Update CORS Origin

After deploying frontend to Netlify (Phase 5):

1. Go to Render Dashboard → Your Service
2. Click **"Environment"** tab
3. Find `CORS_ORIGIN`
4. Update value to: `https://your-app.netlify.app`
5. Click **"Save Changes"**
6. Service will auto-redeploy

---

## 📊 Monitoring & Logs

### View Logs
1. Render Dashboard → Your Service
2. Click **"Logs"** tab
3. See real-time logs
4. Filter by error/warning/info

### Check Metrics
1. Click **"Metrics"** tab
2. View CPU, Memory, Bandwidth usage
3. Response times and request counts

### Alerts
1. Click **"Settings"** → **"Alerts"**
2. Set up email notifications for downtime
3. Configure CPU/Memory thresholds

---

## 🐛 Troubleshooting

### Build Failed

**Check logs for errors:**
```
npm ERR! Missing script: "start"
```
**Fix**: Verify `package.json` has `"start": "node src/index.js"`

**Dependency issues:**
```
npm ERR! Cannot find module 'express'
```
**Fix**: Check `package.json` dependencies are correct

---

### Service Won't Start

**Port binding error:**
```
Error: Port 3000 is already in use
```
**Fix**: Ensure you're using `process.env.PORT` in code:
```javascript
const PORT = process.env.PORT || 4000;
```

**Database connection failed:**
```
Error: getaddrinfo ENOTFOUND
```
**Fix**: 
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure SSL is enabled in `db.js`

---

### 503 Service Unavailable

**Free tier spin-down:**
- Free services sleep after 15 min inactivity
- First request takes 30-60 seconds to wake up
- **Solution**: Upgrade to Starter plan ($7/month) for 24/7 uptime

---

### Environment Variable Issues

**Variable not loading:**
1. Check spelling matches exactly
2. No extra spaces in values
3. Click "Save Changes" after editing
4. Service auto-redeploys when env changes

**Testing variables:**
Add a test endpoint in your code:
```javascript
app.get('/env-test', (req, res) => {
  res.json({
    node_env: process.env.NODE_ENV,
    has_db: !!process.env.DATABASE_URL,
    has_jwt: !!process.env.JWT_SECRET
  });
});
```

---

## 🔐 Security Best Practices

### ✅ Do:
- Use strong JWT_SECRET (min 32 chars)
- Enable HTTPS only (Render does this automatically)
- Set proper CORS_ORIGIN
- Use environment variables for all secrets
- Rotate keys periodically

### ❌ Don't:
- Commit `.env` files to Git
- Use weak passwords
- Set CORS_ORIGIN to `*` in production
- Hardcode API keys in code
- Share environment variables publicly

---

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ Automatic HTTPS
- ✅ Custom domains
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Limited to 512 MB RAM

### Starter ($7/month)
- ✅ Always on (no spin-down)
- ✅ 512 MB RAM
- ✅ More compute power
- ✅ Better for production

### Professional ($25/month)
- ✅ 2 GB RAM
- ✅ Horizontal scaling
- ✅ Priority support

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit: `git commit -m "Update API"`
3. Push: `git push origin main`
4. Render detects push and auto-deploys
5. Check logs for deployment status

**Disable auto-deploy:**
- Settings → Auto-Deploy → Toggle OFF
- Deploy manually from Dashboard

---

## 📝 Custom Domain (Optional)

Add your own domain:

1. Buy domain (e.g., Namecheap, GoDaddy)
2. Render Dashboard → Your Service → Settings
3. Click **"Custom Domain"**
4. Add domain: `api.yourdomain.com`
5. Add DNS records:
   ```
   Type: CNAME
   Name: api
   Value: saiscientifics-backend.onrender.com
   ```
6. Wait for DNS propagation (5-30 minutes)

---

## ✅ Deployment Checklist

Before marking Phase 4 complete:

- [ ] Render account created
- [ ] SS-Backend repo connected
- [ ] All environment variables added
- [ ] Build completed successfully
- [ ] Service is live and accessible
- [ ] Health check endpoint returns 200 OK
- [ ] Database connection working
- [ ] Backend URL copied for frontend
- [ ] Logs showing no errors
- [ ] Test API endpoints working

---

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Environment Variables Guide](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

---

## 📞 Support

**Render Issues:**
- Render Community: [community.render.com](https://community.render.com)
- Email: support@render.com
- Status: [status.render.com](https://status.render.com)

**Backend Issues:**
- Check logs in Render Dashboard
- Test locally first: `npm run dev`
- Verify database connection: `node test-supabase.js`

---

## 🎯 Next Steps

After successful deployment:

1. ✅ **Copy backend URL**: `https://saiscientifics-backend.onrender.com`
2. ➡️ **Proceed to Phase 5**: Deploy frontend to Netlify
3. 🔧 **Update frontend**: Set `VITE_API_URL` to backend URL
4. 🧪 **Test integration**: Frontend → Backend → Database

---

**Your Backend URL**: `https://saiscientifics-backend.onrender.com`

Save this URL - you'll need it for Phase 5! 🚀
