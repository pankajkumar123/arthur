# 🎯 Hostinger Deployment Checklist

**Platform:** Hostinger  
**Estimated Time:** 45-60 minutes  
**Date:** ________________

---

## 📋 Pre-Deployment (10 min)

### Account & Domain
- [ ] Hostinger account active (Business/Premium plan)
- [ ] Domain name ready: _______________________
- [ ] SSL certificate enabled
- [ ] SSH access enabled

### Local Preparation
- [ ] Code pushed to GitHub
- [ ] Latest changes pulled locally
- [ ] All tests passing
- [ ] No committed `.env` files

---

## 🎨 Frontend Deployment (15 min)

### Build
- [ ] `cd c:\SS\myapp`
- [ ] Create `.env.production` with `VITE_API_URL`
- [ ] `npm install`
- [ ] `npm run build:hostinger`
- [ ] Verify `dist/` folder created
- [ ] Verify `.htaccess` in `dist/`

### Upload
- [ ] Login to Hostinger hPanel
- [ ] Files → File Manager → `public_html`
- [ ] Backup existing files
- [ ] Delete old files
- [ ] Upload all from `dist/`
- [ ] Verify `.htaccess` uploaded

### Test
- [ ] Visit https://yourdomain.com
- [ ] No console errors (F12)
- [ ] All pages load: `/login`, `/register`, `/cart`, `/orders`, `/rfq`
- [ ] HTTPS working (🔒 green padlock)
- [ ] Mobile responsive

---

## ⚙️ Backend Deployment (20 min)

### Node.js App Setup
- [ ] hPanel → Advanced → Node.js
- [ ] Create application:
  - Node version: **18+**
  - Mode: **Production**
  - Path: `/home/user/domains/yourdomain.com/api`
  - URL: `https://yourdomain.com/api`
  - Startup: `src/index.js`
  - Port: `4000`

### Upload Backend
- [ ] SSH or File Manager
- [ ] Upload `myapp/server/*` (exclude `node_modules`)
- [ ] `npm install --production`

### Environment Variables
Add in Node.js panel or `.env`:
- [ ] `PORT=4000`
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=postgresql://...`
- [ ] `JWT_SECRET=` (32+ chars)
- [ ] `FRONTEND_URL=https://yourdomain.com`
- [ ] `SUPABASE_URL=` (if using)
- [ ] `SUPABASE_ANON_KEY=` (if using)

### Start & Test
- [ ] Start application in Node.js panel
- [ ] Visit `https://yourdomain.com/api/health`
- [ ] Should return `{"status":"ok"}`
- [ ] Check logs for errors

---

## 🗄️ Database (5 min)

### Using Supabase (Recommended)
- [ ] Keep current `DATABASE_URL`
- [ ] Test connection: `npm run db:test`
- [ ] ✅ No changes needed

### OR Migrate to Hostinger PostgreSQL
- [ ] Create database in hPanel
- [ ] Export from Supabase
- [ ] Import via phpPgAdmin
- [ ] Update `DATABASE_URL`
- [ ] Restart backend

---

## ✅ Full System Test (10 min)

### End-to-End Flow
- [ ] **Register:** Create new account
- [ ] **Login:** Login with credentials
- [ ] **Products:** Browse catalog
- [ ] **Cart:** Add items, update quantity
- [ ] **Orders:** View order history
- [ ] **RFQ:** Submit quote request
- [ ] **Logout:** Logout successfully

### Performance
- [ ] Page load < 3 sec
- [ ] API response < 1 sec
- [ ] No console errors
- [ ] All images load

### Cross-Platform
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Mobile browser
- [ ] Tablet view

---

## 🔐 Security Check

- [ ] HTTPS enforced (all HTTP → HTTPS)
- [ ] `.env` files not in Git
- [ ] Strong JWT secret (32+ chars)
- [ ] CORS configured (only your domain)
- [ ] Database credentials secure

---

## 💾 Backup Setup

- [ ] Database backup enabled
- [ ] Schedule: Daily at 2 AM
- [ ] Test backup restore
- [ ] Off-server copy saved

---

## 📊 Monitoring

- [ ] Check Node.js logs
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Test error logging
- [ ] Verify email notifications (if configured)

---

## 🎉 Deployment Complete!

### URLs
- **Frontend:** https://_______________________
- **Backend API:** https://_______________________/api
- **Database:** (Supabase dashboard or Hostinger phpPgAdmin)
- **GitHub:** https://github.com/umeshchandracholleti/SS

### Credentials Saved
- [ ] Hostinger hPanel login
- [ ] SSH credentials
- [ ] Database credentials
- [ ] All API keys/secrets

### Next Steps
- [ ] Monitor for 24 hours
- [ ] Review logs daily (first week)
- [ ] Share access with team
- [ ] Schedule first maintenance

---

**Deployed by:** ________________  
**Deployment time:** _______ minutes  
**Notes:**

```





```

---

## 🆘 Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| 404 on refresh | Check `.htaccess` uploaded |
| API calls fail | Verify `VITE_API_URL` in frontend |
| Backend won't start | Check logs, verify environment variables |
| Database connection error | Test `DATABASE_URL`, check credentials |
| CORS error | Update `FRONTEND_URL` in backend |
| White screen | Check browser console for errors |

---

**Quick Links:**
- [Full Deployment Guide](HOSTINGER_DEPLOYMENT.md)
- [Database Setup](DATABASE_SETUP.md)
- [Troubleshooting](HOSTINGER_DEPLOYMENT.md#-troubleshooting)
