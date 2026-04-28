# 🚀 Quick Deployment Checklist

**Total Time**: 30-40 minutes | **Cost**: $0

---

## ✅ Phase 4: Backend to Render (15 min)

### 1. Pre-Flight Check
- [ ] Supabase active with 12 tables
- [ ] `myapp/server/.env.local` has all secrets
- [ ] `SS-Backend` repo pushed to GitHub

### 2. Deploy to Render
1. [ ] Go to [render.com](https://render.com) → Sign up with GitHub
2. [ ] New + → Web Service → Connect `SS-Backend`
3. [ ] Configure:
   ```
   Name: saiscientifics-backend
   Build: npm install
   Start: npm start
   ```
4. [ ] Add 9 environment variables (Advanced):
   - [ ] `NODE_ENV=production`
   - [ ] `PORT=4000`
   - [ ] `DATABASE_URL` (from Supabase)
   - [ ] `SUPABASE_URL` (from Supabase)
   - [ ] `SUPABASE_ANON_KEY` (from Supabase)
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` (from Supabase)
   - [ ] `JWT_SECRET` (32+ random chars)
   - [ ] `JWT_EXPIRES_IN=7d`
   - [ ] `CORS_ORIGIN=*` (update later)
5. [ ] Click "Create Web Service"
6. [ ] Wait 2-4 minutes for build

### 3. Verify Backend
- [ ] Visit: `https://YOUR-SERVICE.onrender.com/api/health`
- [ ] Should see: `{"status":"ok"}`
- [ ] Visit: `https://YOUR-SERVICE.onrender.com/api/health/db`
- [ ] Should see: `{"database":"connected"}`

### 4. Save Your Backend URL
```
Backend URL: https://_____________________________.onrender.com
```

---

## ✅ Phase 5: Frontend to Netlify (15 min)

### 1. Pre-Flight Check
- [ ] ✅ Phase 4 complete (backend working)
- [ ] Backend URL copied
- [ ] `SS-Frontend` repo pushed to GitHub

### 2. Deploy to Netlify
1. [ ] Go to [netlify.com](https://app.netlify.com) → Sign up with GitHub
2. [ ] Add new site → Import from GitHub → Select `SS-Frontend`
3. [ ] Configure:
   ```
   Base directory: myapp
   Build command: npm run build
   Publish directory: myapp/dist
   ```
4. [ ] Add environment variable:
   - [ ] Key: `VITE_API_URL`
   - [ ] Value: `https://YOUR-BACKEND.onrender.com` (from Phase 4)
5. [ ] Click "Deploy site"
6. [ ] Wait 1-3 minutes for build

### 3. Verify Frontend
- [ ] Visit: `https://YOUR-SITE.netlify.app`
- [ ] Page loads without errors
- [ ] Open DevTools (F12) → Console → No red errors

### 4. Save Your Frontend URL
```
Frontend URL: https://_____________________________.netlify.app
```

---

## ✅ Phase 5b: Update CORS (5 min)

### 1. Update Backend CORS
1. [ ] Go to [dashboard.render.com](https://dashboard.render.com)
2. [ ] Click your backend service
3. [ ] Environment tab
4. [ ] Find `CORS_ORIGIN` variable
5. [ ] Update to: `https://YOUR-SITE.netlify.app`
6. [ ] Click "Save Changes"
7. [ ] Wait 30-60 seconds for redeploy

### 2. Final Test
- [ ] Visit frontend URL
- [ ] Open DevTools → Network tab
- [ ] Trigger an API call (register, view products, etc.)
- [ ] Should see requests to backend (200 OK status)
- [ ] No CORS errors in console

---

## 🎯 Success Criteria

All must be ✅:
- [ ] Backend health check returns `{"status":"ok"}`
- [ ] Database health check returns `{"database":"connected"}`
- [ ] Frontend loads on Netlify URL
- [ ] No console errors in browser (F12)
- [ ] API calls reach backend (Network tab shows requests)
- [ ] Backend returns data (no CORS errors)

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build failed | Check base directory is `myapp` |
| CORS errors | Update `CORS_ORIGIN` in Render, wait 1 min |
| API goes to localhost | Check `VITE_API_URL` set in Netlify |
| Backend slow (30-60s) | Normal! Free tier spins down after 15 min idle |
| 404 on routes | Already fixed via `netlify.toml` |

---

## 📝 Your Deployment Info

**Fill this out as you deploy:**

```
═══════════════════════════════════════════════════════
                 DEPLOYMENT INFORMATION
═══════════════════════════════════════════════════════

Backend (Render):
URL: https://_____________________________.onrender.com
Service Name: _______________________________________
Region: Oregon (US West)
Status: ☐ Deployed ☐ Health Check OK ☐ DB Check OK

Frontend (Netlify):
URL: https://_____________________________.netlify.app
Site Name: _______________________________________
Status: ☐ Deployed ☐ Loads OK ☐ API Connected

Database (Supabase):
URL: https://ruyfgshfsjlnlbldtpoi.supabase.co
Status: ☐ Active ☐ 12 Tables Created

CORS Configuration:
CORS_ORIGIN: ☐ Updated to Netlify URL
Status: ☐ No CORS Errors

═══════════════════════════════════════════════════════
                    DEPLOYMENT COMPLETE ✅
═══════════════════════════════════════════════════════
```

---

## ⏭️ Next Steps After Deployment

1. **Phase 6**: Update documentation with live URLs
2. **Phase 7**: Full integration testing
3. **Phase 8**: Record demo video and submit

---

## 🔗 Quick Links

- **Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
- **Netlify Dashboard**: [app.netlify.com](https://app.netlify.com)
- **Supabase Dashboard**: [app.supabase.com](https://app.supabase.com)
- **GitHub Repos**: [github.com/umeshchandracholleti](https://github.com/umeshchandracholleti)

---

## 💾 Environment Variables Reference

**Backend (Render) - 9 Essential:**
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
JWT_SECRET=your-32-char-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-site.netlify.app
```

**Frontend (Netlify) - 1 Essential:**
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

**Print this page and check off items as you go! 📋✅**
