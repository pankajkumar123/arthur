# GitHub Repository Split - Setup Guide

This guide walks you through creating two separate GitHub repositories for frontend and backend, and pushing your code to them.

## 📋 Overview

After this process, you'll have:
- `SS-Frontend` - React app with Tailwind + ShadCN UI
- `SS-Backend` - Node/Express API with Supabase

## 🎯 Step 1: Create GitHub Repositories

### Create SS-Frontend Repository
1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `SS-Frontend`
3. **Description**: "Sai Scientifics - Industrial Supplies Frontend | React + Vite + Tailwind"
4. **Public** (for portfolio)
5. **Initialize with**:
   - ✅ Add a README file
   - ✅ Add .gitignore (select Node)
   - ✅ Choose a license (MIT)
6. Click **Create repository**

**Copy the HTTPS URL** (e.g., `https://github.com/umeshchandracholleti/SS-Frontend.git`)

### Create SS-Backend Repository
1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `SS-Backend`
3. **Description**: "Sai Scientifics - Industrial Supplies Backend API | Node + Express + Supabase"
4. **Public** (for portfolio)
5. **Initialize with**:
   - ✅ Add a README file
   - ✅ Add .gitignore (select Node)
   - ✅ Choose a license (MIT)
6. Click **Create repository**

**Copy the HTTPS URL** (e.g., `https://github.com/umeshchandracholleti/SS-Backend.git`)

---

## 🚀 Step 2: Push Frontend Code

### In PowerShell, navigate to the frontend directory

```powershell
cd C:\SS\myapp
```

### Check git status (current monorepo)
```powershell
git status
```

### Initialize frontend-only git repo
```powershell
# Remove old git history (start fresh)
Remove-Item .git -Recurse -Force

# Initialize new repo
git init
git branch -M main

# Add all frontend files (excluding server/)
git add src/ public/ index.html tailwind.config.js postcss.config.js vite.config.js package.json package-lock.json .gitignore README.md DEVELOPER_QUICK_REFERENCE.md

# Commit
git commit -m "Initial commit: Frontend - React + Vite + Tailwind"

# Add remote
git remote add origin https://github.com/umeshchandracholleti/SS-Frontend.git

# Push to GitHub
git push -u origin main
```

✅ **Frontend pushed successfully!**

---

## 🚀 Step 3: Push Backend Code

### In PowerShell, navigate to the backend directory

```powershell
cd C:\SS\myapp\server
```

### Initialize backend-only git repo
```powershell
# Initialize new repo
git init
git branch -M main

# Add all backend files
git add .

# Commit
git commit -m "Initial commit: Backend API - Node + Express + Supabase"

# Add remote
git remote add origin https://github.com/umeshchandracholleti/SS-Backend.git

# Push to GitHub
git push -u origin main
```

✅ **Backend pushed successfully!**

---

## 📁 Step 4: Update Original Monorepo

If you want to keep the original monorepo with references to both:

```powershell
cd C:\SS

# Initialize root repo
git init
git branch -M main

# Add key files
git add build.proj SS.Web.sln SUPABASE_MIGRATION_COMPLETE.md PHASE3_FRONTEND_UPGRADE_COMPLETE.md

# Commit
git commit -m "Root repo: References to separate FE/BE repositories"

# Add remote to original monorepo if needed
git remote add origin https://github.com/umeshchandracholleti/SS.git

# Push
git push -u origin main
```

---

## ✅ Verification

### Check Frontend Repo
```powershell
cd C:\SS\myapp
git remote -v
# Should show: origin https://github.com/umeshchandracholleti/SS-Frontend.git

git log --oneline
# Should show your commits
```

### Check Backend Repo
```powershell
cd C:\SS\myapp\server
git remote -v
# Should show: origin https://github.com/umeshchandracholleti/SS-Backend.git

git log --oneline
# Should show your commits
```

---

## 📝 Important Files to Include

### Frontend (SS-Frontend)
✅ Included:
- `src/` - React components, pages, services, context
- `public/` - Static assets
- `index.html` - Vite entry
- `tailwind.config.js` - Tailwind config
- `postcss.config.js` - PostCSS config
- `vite.config.js` - Vite config
- `package.json` - Dependencies
- `README.md` - Documentation
- `.gitignore` - Ignore rules

❌ Excluded:
- `server/` - Backend code
- `.env` - Never commit secrets!
- `node_modules/` - Git ignores this

### Backend (SS-Backend)
✅ Included:
- `src/` - Express routes, middleware, db
- `scripts/` - Migration, seed scripts
- `tests/` - Test files
- `package.json` - Dependencies
- `README.md` - Documentation
- `.env.example` - Template (no values!)
- `.gitignore` - Ignore rules

❌ Excluded:
- `.env.local` - Never commit! (has passwords)
- `node_modules/` - Git ignores this

---

## 🔐 Environment Variables - IMPORTANT

### Never commit these files:
- `.env` (frontend)
- `.env.local` (backend)
- `.env.production` (backend)

They contain secrets that could be misused!

### Instead, use `.env.example`:
Files are already set up with templates. Users should:
1. Copy `.env.example` → `.env`
2. Fill in their own values

---

## 🚀 Future Workflow

After splitting:

### For Frontend Development
```powershell
cd C:\SS\myapp
git add src/...
git commit -m "Add feature"
git push
```

### For Backend Development
```powershell
cd C:\SS\myapp\server
git add src/...
git commit -m "Add API endpoint"
git push
```

### Sync both during debugging:
```powershell
# Terminal 1: Backend
cd C:\SS\myapp\server
npm run dev

# Terminal 2: Frontend
cd C:\SS\myapp
npm run dev

# Open browser to http://localhost:5173
```

---

## 📚 After Push: Deploy Preparation

### Frontend → Netlify
1. Go to [netlify.com](https://netlify.com)
2. **Import from Git** → Select `SS-Frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment: `VITE_API_URL=<your-render-backend-url>`
6. Deploy

### Backend → Render
1. Go to [render.com](https://render.com)
2. **Create Web Service** → Connect GitHub
3. Select `SS-Backend` repo
4. Start command: `npm start`
5. Add all environment variables from `.env.local`
6. Deploy

---

## 🎯 Checklist

- [ ] Created `SS-Frontend` GitHub repo
- [ ] Created `SS-Backend` GitHub repo
- [ ] Pushed frontend code to SS-Frontend
- [ ] Pushed backend code to SS-Backend
- [ ] Verified both repos have code
- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] Ready for Phase 4: Deploy to Render
- [ ] Ready for Phase 5: Deploy to Netlify

---

## 📞 Troubleshooting

### "Repository not found"
```
git remote -v
# If URL is wrong, update it:
git remote set-url origin <correct-url>
```

### "Permission denied"
Make sure your GitHub credentials are set:
```powershell
git config --global user.email "your@email.com"
git config --global user.name "Your Name"
```

### "Changes to commit" warning
Include all important files:
```powershell
git status
git add <files>
git commit -m "message"
```

---

**Repository split is ready. Proceed to Phase 4: Backend Deployment! 🚀**
