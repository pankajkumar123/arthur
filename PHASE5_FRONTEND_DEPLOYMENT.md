# Phase 5: Frontend Deployment to Netlify

## 📋 Pre-Deployment Checklist

Before deploying to Netlify, verify everything is ready:

### ✅ Phase 4 Must Be Complete
- [ ] Backend deployed to Render successfully
- [ ] Backend URL copied: `https://saiscientifics-backend.onrender.com`
- [ ] Backend health check working: `/api/health`
- [ ] Backend database check working: `/api/health/db`

### Frontend Repository
- [ ] Code pushed to GitHub `SS-Frontend` repository
- [ ] `package.json` has correct `build` script: `"build": "vite build"`
- [ ] `.gitignore` excludes sensitive files (`.env`, `.env.local`, `node_modules/`, `dist/`)
- [ ] No hardcoded API URLs in code

### Frontend Code
- [ ] `src/services/api.js` uses `import.meta.env.VITE_API_URL`
- [ ] Default fallback: `http://localhost:4000`
- [ ] All API calls use the centralized API service

### Local Testing
- [ ] Frontend runs locally: `npm run dev`
- [ ] Build succeeds: `npm run build` (creates `dist/` folder)
- [ ] No build errors or warnings
- [ ] Test with local backend connection

---

## 🚀 Deployment Process (15-20 minutes)

### Step 1: Access Netlify (2 min)
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up or log in with GitHub
3. Verify email if needed

### Step 2: Create New Site (3 min)
1. Click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Authorize GitHub access
4. Select **`SS-Frontend`** repository
5. Click on the repository to configure

### Step 3: Configure Build Settings (5 min)

**Site Settings:**
```
Site name: saiscientifics (or your preferred name)
Branch to deploy: main
```

**Build Settings:**
```
Base directory: myapp
Build command: npm run build
Publish directory: myapp/dist
```

> **Important**: Set base directory to `myapp` since your frontend is in a subdirectory

**Build Environment:**
```
Node version: 20
```

### Step 4: Add Environment Variable (3 min)

**Critical Step**: Add your backend URL

1. Before clicking "Deploy", scroll to **"Environment variables"**
2. Click **"Add environment variable"**
3. Add this variable:

```env
Key: VITE_API_URL
Value: https://saiscientifics-backend.onrender.com
```

> **Replace** `saiscientifics-backend` with your actual Render service name from Phase 4

### Step 5: Deploy! (2 min)
1. Click **"Deploy site"**
2. Wait for build (1-3 minutes)
3. Watch build logs for errors

**Expected output:**
```
12:00:00 AM: Build ready to start
12:00:05 AM: Cloning repository...
12:00:10 AM: Installing NPM modules...
12:00:30 AM: Running build command: npm run build
12:01:00 AM: vite v5.x.x building for production...
12:01:20 AM: ✓ built in 18.5s
12:01:21 AM: Site is live
```

### Step 6: Get Your Live URL (1 min)

After deployment completes:
- Your site URL: `https://saiscientifics.netlify.app`
- Or custom name: `https://YOUR-SITE-NAME.netlify.app`

**Copy this URL** - you'll need it for the next step!

---

## 🔄 Update Backend CORS (Critical!)

Your frontend can't connect to the backend without updating CORS settings:

### Step 1: Go Back to Render
1. Open [dashboard.render.com](https://dashboard.render.com)
2. Click your **`saiscientifics-backend`** service
3. Go to **"Environment"** tab

### Step 2: Update CORS_ORIGIN
1. Find the `CORS_ORIGIN` variable
2. Change from `*` to your Netlify URL:
   ```
   https://saiscientifics.netlify.app
   ```
3. Click **"Save Changes"**
4. Wait for automatic redeployment (30-60 seconds)

> **Note**: Service will auto-restart with new CORS settings

---

## ✅ Post-Deployment Verification

### Test Frontend in Browser
1. Open your Netlify URL: `https://saiscientifics.netlify.app`
2. Check browser console (F12) for errors
3. Should see the landing page

### Test API Connection
1. Open browser DevTools (F12) → Network tab
2. Try to fetch products or trigger any API call
3. Should see requests to your Render backend
4. Check for 200 OK responses (not 404 or CORS errors)

### Test Key Functionality
- [ ] Page loads without console errors
- [ ] Can view products (if implemented)
- [ ] Can register/login (if implemented)
- [ ] API calls show in Network tab
- [ ] No CORS errors in console

### Check Netlify Dashboard
1. Go to Netlify Dashboard
2. Click your site
3. Check **"Deploys"** tab - should show "Published"
4. Check **"Functions"** tab - should be empty (we're not using functions yet)

---

## 🎯 What You Should Have Now

After successful deployment:

- ✅ Frontend running on Netlify
- ✅ Live URL: `https://saiscientifics.netlify.app`
- ✅ Connected to Render backend
- ✅ CORS configured correctly
- ✅ Auto-deploy on GitHub push enabled
- ✅ HTTPS enabled automatically

**Save both URLs:**
- Frontend: `https://saiscientifics.netlify.app`
- Backend: `https://saiscientifics-backend.onrender.com`

---

## 🐛 Troubleshooting

### Build Failed
**Error**: `npm ERR! missing script: build`
**Fix**: 
- Check base directory is set to `myapp`
- Verify `package.json` has `"build": "vite build"`

**Error**: `Module not found` during build
**Fix**:
- Ensure all dependencies are in `package.json`, not just `devDependencies`
- Rebuild locally: `npm run build`

### Site Loads but API Fails
**Error**: Console shows `Network Error` or `ERR_CONNECTION_REFUSED`
**Fix**:
- Check `VITE_API_URL` is set correctly in Netlify
- Verify backend URL is accessible: `https://your-backend.onrender.com/api/health`
- Check backend logs in Render dashboard

### CORS Errors
**Error**: `Access to fetch at 'https://...' has been blocked by CORS`
**Fix**:
- Update `CORS_ORIGIN` in Render to match exact Netlify URL
- Include `https://` protocol
- No trailing slash
- Wait for Render to redeploy

### 404 on Non-Root Routes
**Error**: Refreshing `/products` gives 404
**Status**: ✅ Already Fixed
**Configured**: `netlify.toml` and `public/_redirects` handle SPA routing

### Environment Variable Not Working
**Symptoms**: API calls go to localhost instead of Render
**Fix**:
- Verify variable name is exactly `VITE_API_URL` (all caps)
- Check it's set in Netlify Environment Variables
- Redeploy: Settings → Deploys → "Trigger deploy" → "Clear cache and deploy"

### Old Build Cached
**Error**: Changes not appearing
**Fix**:
- Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
- Or clear cache and redeploy in Netlify

---

## 🔧 Custom Domain (Optional)

Want a custom domain like `saiscientifics.com`?

### Step 1: Purchase Domain
- Namecheap, GoDaddy, Google Domains, etc.

### Step 2: Add Domain to Netlify
1. Netlify Dashboard → Your Site → **"Domain settings"**
2. Click **"Add custom domain"**
3. Enter your domain: `saiscientifics.com`
4. Click **"Verify"**

### Step 3: Configure DNS
1. Copy Netlify's nameservers or A/CNAME records
2. Go to your domain registrar
3. Update DNS settings with Netlify's values
4. Wait 24-48 hours for propagation

### Step 4: Enable HTTPS
1. Netlify automatically provisions SSL certificate
2. Force HTTPS: Domain settings → **"Enable HTTPS"**

### Step 5: Update Backend CORS
1. Go back to Render
2. Update `CORS_ORIGIN` to `https://saiscientifics.com`
3. Service auto-redeploys

---

## 🔄 Continuous Deployment

Netlify automatically redeploys when you push to GitHub:

```powershell
# Make changes
cd C:\SS\myapp
# Edit files...

# Commit and push
git add .
git commit -m "Update homepage"
git push origin main

# Netlify detects push and auto-deploys
# Check deploy logs in Netlify Dashboard
```

**Deploy notifications:**
- Enable in: Site settings → Build & deploy → Deploy notifications
- Options: Email, Slack, webhook

---

## 💰 Free Tier Limits

**Netlify Free Plan:**
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ Instant rollbacks
- ✅ Custom domains (1 per site)
- ✅ No credit card required

**Need more?**
- Pro plan: $19/mo
- Unlimited bandwidth
- Advanced features

---

## 📊 Performance Optimization

### Enable Production Mode
Already configured in `netlify.toml`:
- Asset caching (1 year for `/assets/*`)
- Security headers
- Gzip compression (automatic)

### Lighthouse Score
Test your site:
1. Open site in Chrome
2. F12 → Lighthouse tab
3. Click "Generate report"
4. Target: 90+ in all categories

### Bundle Size
Check build output:
```
dist/assets/index-[hash].js  465 KB
dist/assets/index-[hash].css  17 KB
```

**Optimization tips:**
- Code splitting (React.lazy)
- Image optimization (WebP format)
- Remove unused dependencies

---

## 📝 Deployment Summary

**What was deployed:**
- React 19.2 frontend
- Vite build (optimized)
- Tailwind CSS v4
- ShadCN UI components
- Axios API client
- Authentication context

**Infrastructure:**
- Hosting: Netlify CDN (global)
- Backend API: Render (Oregon)
- Database: Supabase (AWS us-west-1)
- SSL: Automatic HTTPS
- Deployment: Git-based CI/CD

**Configuration files created:**
- `netlify.toml` - Build and redirect config
- `public/_redirects` - SPA routing fallback
- `.env.example` - Environment variable template

---

## ➡️ Next Steps

1. ✅ **Phase 4 Complete**: Backend deployed to Render
2. ✅ **Phase 5 Complete**: Frontend deployed to Netlify
3. 🔜 **Phase 6**: Update documentation with live URLs
4. 🔜 **Phase 7**: Full integration testing
5. 🔜 **Phase 8**: Demo video and submission

---

## 📞 Support

**Netlify Issues:**
- Community: [answers.netlify.com](https://answers.netlify.com)
- Docs: [docs.netlify.com](https://docs.netlify.com)
- Status: [status.netlify.com](https://status.netlify.com)

**Frontend Issues:**
- Check build logs in Netlify Dashboard
- Test locally: `npm run build` then `npm run preview`
- Check browser console for errors

**Backend Connection Issues:**
- Verify backend health: `https://your-backend.onrender.com/api/health`
- Check CORS_ORIGIN is correct in Render
- Verify VITE_API_URL in Netlify environment variables

---

## 🎉 Congratulations!

Your full-stack application is now live:
- Frontend: Netlify CDN (global edge network)
- Backend: Render servers (always HTTPS)
- Database: Supabase PostgreSQL (managed)

**Share your URLs with the world! 🚀**

---

**Ready for Phase 6 & 7? Let's test everything end-to-end!**
