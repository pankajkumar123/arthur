# Phase 5: Frontend Deployment to Netlify

## ✅ Pre-Deployment Checklist

- [ ] Frontend code pushed to GitHub `SS` (or `SS-Frontend`) repository
- [ ] `package.json` in root has correct `build` script: `"build": "vite build"`
- [ ] `.gitignore` excludes `.env.local`, `node_modules/`, `dist/`
- [ ] No hardcoded API URLs in code (using `import.meta.env.VITE_API_URL`)

---

## 📋 Configuration Values

**Backend URL (from Phase 4):**
```
https://saiscientifics-backend1.onrender.com
```

**Frontend Repository:** `SS` or `SS-Frontend`

**Build Output Folder:** `dist/`

**Build Command:** `npm run build`

---

## 🚀 Deployment Steps (10 minutes)

### Step 1: Access Netlify

1. Go to [https://netlify.com](https://netlify.com)
2. Sign up or login with **GitHub**
3. Verify email if needed

### Step 2: Create New Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Click **"GitHub"** (authorize if needed)
3. Search and select your repository: **`SS`** or **`SS-Frontend`**
4. Click **"Install"** to authorize GitHub access
5. Select repository from list
6. Click **"Connect & deploy"**

### Step 3: Configure Build Settings

On the "Site settings" page, fill EXACTLY:

```
Base directory:     (leave BLANK)
Build command:      npm run build
Publish directory:  dist
```

### Step 4: Add Environment Variables

1. Click **"Site settings"** (top menu)
2. Click **"Build & deploy"** → **"Environment"**
3. Click **"Edit variables"**
4. Add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://saiscientifics-backend1.onrender.com` |

5. Click **"Save"**

### Step 5: Deploy

Method A (Recommended - Auto-deploy):
1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 1-2 minutes

Method B (Manual):
1. Go to **"Deploys"** (top menu)
2. Scroll to manual deploys section
3. Drag and drop the `dist/` folder from your computer
4. Wait for upload

---

## ✅ Verify Deployment

Once you see **"Site is live"** message:

### Get Your Frontend URL

In Netlify dashboard, you'll see:
```
Site name: [something].netlify.app
Live URL:  https://[something].netlify.app
```

### Test the Site

1. Open your live URL in browser
2. Should load the React app homepage
3. Try these actions:
   - ✅ See products load (from backend)
   - ✅ Add to cart
   - ✅ Navigate pages
   - ✅ Check browser console for no errors

### Test Backend Connection

Open browser DevTools (F12):
1. Click **Console** tab
2. You should NOT see CORS errors
3. If errors: Check `VITE_API_URL` is set correctly

---

## 📊 What You Should See

**Netlify Dashboard:**
- Status: **"Live"**
- Last deploy: **"Success"**
- Deploy log: All green checkmarks ✅

**Your Site:**
- Page loads without errors
- Can see products from backend database
- API calls work (check Network tab in DevTools)

---

## 🐛 Troubleshooting

### Build Failed in Netlify
**Error in logs:** `npm ERR! missing script`
**Fix:** 
1. Check `package.json` has `"build": "vite build"`
2. Verify it's in the root of your repo
3. Trigger deploy again

### API Calls Not Working (CORS Error)
**Error:** `Access to XMLHttpRequest blocked by CORS policy`
**Fix:**
1. Verify `VITE_API_URL` environment variable is set
2. Check value is exactly: `https://saiscientifics-backend1.onrender.com`
3. Update backend CORS if needed (in Render dashboard):
   - Go to backend service
   - Environment variables
   - Update `CORS_ORIGIN` to: `https://[your-netlify-url].netlify.app`
   - Project auto-redeploys

### Blank Page or 404
**Error:** Page shows nothing or 404 errors
**Fix:**
1. Check browser console for JavaScript errors
2. Verify `dist/` folder exists (in Netlify logs)
3. Trigger a new deploy
4. Clear browser cache (Ctrl+Shift+Delete)

### Environment Variable Not Working
**Fix:**
1. Verify `VITE_API_URL` is in Netlify Build & Deploy → Environment
2. Check spelling exactly matches
3. Value must start with `https://`
4. Trigger new deploy
5. Hard refresh browser (Ctrl+Shift+R)

---

## 🎯 Update Backend CORS

After you get your Netlify URL, update backend to allow it:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click your backend service: **saiscientifics-backend1**
3. Click **Environment**
4. Find `CORS_ORIGIN` variable
5. Change from `*` to your Netlify URL:
   ```
   https://[your-site-name].netlify.app
   ```
6. Click **"Save"** - service auto-redeploys

---

## 📝 What You'll Have After Phase 5

✅ Frontend deployed to Netlify
✅ Live URL: `https://[your-site-name].netlify.app`
✅ Connected to backend at `https://saiscientifics-backend1.onrender.com`
✅ Full e-commerce site live and functional
✅ Auto-deploy enabled (updates on GitHub push)

---

## 🔄 How to Update Your Site

After deployment, any changes you push to GitHub automatically deploy:

```powershell
cd C:\SS
# Make changes to code...

git add .
git commit -m "Update feature X"
git push origin main

# Netlify detects push and auto-deploys to your live site!
# Check "Deploys" tab in Netlify dashboard
```

---

## 💾 Save These URLs

**Backend:** `https://saiscientifics-backend1.onrender.com`
**Frontend:** `https://[your-netlify-url].netlify.app` (you'll get this)

You'll need them for:
- Phase 6: Integration testing
- Phase 7: Documentation
- Phase 8: Demo video

---

## ✨ Success!

Once both are live:
- ✅ E-commerce site fully deployed
- ✅ Users can access from internet
- ✅ All features working
- ✅ Ready for demo

---

**After deploying to Netlify, tell me your site URL and I'll help with Phase 6!**
