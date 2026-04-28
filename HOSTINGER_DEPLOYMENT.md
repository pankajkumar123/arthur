# Hostinger Deployment Guide

Complete guide to deploy Sai Scientifics application to Hostinger hosting.

---

## 📋 Prerequisites

### Hostinger Requirements
- **Hosting Plan:** Business or Premium (for Node.js support)
- **Features Needed:**
  - Static website hosting (Frontend)
  - Node.js hosting (Backend)
  - PostgreSQL database (or use existing Supabase)
  - SSL certificate (free with Hostinger)
  - Custom domain support

### Local Requirements
- Node.js 18+ installed
- Git installed
- FTP client (FileZilla recommended) or use Hostinger File Manager
- SSH access enabled in Hostinger panel

---

## 🏗️ Project Structure

```
SS/
├── myapp/                    # Frontend (React + Vite)
│   ├── src/
│   ├── dist/                # Build output (upload this to Hostinger)
│   ├── package.json
│   └── vite.config.js
├── myapp/server/            # Backend (Node.js + Express)
│   ├── src/
│   ├── package.json
│   └── src/index.js
└── HOSTINGER_DEPLOYMENT.md  # This file
```

---

## 🚀 Deployment Steps

### Part 1: Frontend Deployment (React App)

#### Step 1: Build Production Frontend
```powershell
cd c:\SS\myapp
npm install
npm run build
```
This creates `myapp/dist` folder with optimized static files.

#### Step 2: Upload to Hostinger
**Option A: File Manager (Recommended for beginners)**
1. Login to Hostinger hPanel
2. Go to **Files → File Manager**
3. Navigate to `public_html` directory
4. Delete default files (index.html, etc.)
5. Upload ALL files from `myapp/dist/*` to `public_html`
6. Upload `.htaccess` file (see Part 3 below)

**Option B: FTP Upload**
1. Get FTP credentials from Hostinger hPanel
2. Connect via FileZilla:
   - Host: your-domain.com
   - Username: (from hPanel)
   - Password: (from hPanel)
   - Port: 21
3. Upload `myapp/dist/*` to `/public_html`
4. Upload `.htaccess` file

**Option C: Git Deployment**
1. SSH into Hostinger server
2. Clone repository:
   ```bash
   cd public_html
   git clone https://github.com/umeshchandracholleti/SS.git temp
   cd temp/myapp
   npm install
   npm run build
   mv dist/* ../../
   cd ../..
   rm -rf temp
   ```

#### Step 3: Configure Environment Variables
Create `.env.production` in `myapp/` (NOT committed to Git):
```env
VITE_API_URL=https://yourdomain.com/api
```

Rebuild after adding:
```powershell
npm run build
```

---

### Part 2: Backend Deployment (Node.js)

#### Step 1: Prepare Backend
```powershell
cd c:\SS\myapp\server
npm install --production
```

#### Step 2: Setup Node.js on Hostinger
1. Login to Hostinger hPanel
2. Go to **Advanced → Node.js**
3. Click **Create Application**
4. Configure:
   - **Node.js Version:** 18 or higher
   - **Application Mode:** Production
   - **Application Root:** `/home/username/domains/yourdomain.com/api`
   - **Application URL:** `https://yourdomain.com/api` or subdomain `api.yourdomain.com`
   - **Application Startup File:** `src/index.js`

#### Step 3: Upload Backend Files
**Via File Manager:**
1. Navigate to application root (e.g., `/home/username/domains/yourdomain.com/api`)
2. Upload entire `myapp/server/*` directory

**Via SSH:**
```bash
cd /home/username/domains/yourdomain.com/api
git clone https://github.com/umeshchandracholleti/SS.git temp
mv temp/myapp/server/* ./
rm -rf temp
npm install --production
```

#### Step 4: Set Environment Variables
In Hostinger Node.js application settings, add:
```
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secure-jwt-secret-min-32-characters
FRONTEND_URL=https://yourdomain.com
```

**For Supabase Database:**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Step 5: Start Application
In Hostinger Node.js panel, click **Start** or **Restart**

---

### Part 3: React Router Configuration (.htaccess)

Create `.htaccess` in `public_html` for SPA routing:

```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Force HTTPS (optional but recommended)
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Handle React Router - send all requests to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

---

### Part 4: Database Setup

#### Option A: Use Existing Supabase (Recommended)
No changes needed. Keep current `DATABASE_URL` in backend environment.

#### Option B: Migrate to Hostinger PostgreSQL
1. **Create Database in Hostinger:**
   - Go to **Databases → PostgreSQL Databases**
   - Create new database
   - Note credentials

2. **Export from Supabase:**
   ```bash
   # In Supabase dashboard, go to Database → Backups
   # Download SQL dump
   ```

3. **Import to Hostinger:**
   - Use phpPgAdmin in Hostinger
   - Or via command line:
   ```bash
   psql -h localhost -U username -d database_name < dump.sql
   ```

4. **Update Backend .env:**
   ```
   DATABASE_URL=postgresql://hostinger_user:password@localhost:5432/yourdatabase
   ```

---

## 🔧 Configuration Files

### myapp/.env.production (Frontend - DO NOT COMMIT)
```env
VITE_API_URL=https://yourdomain.com/api
```

### myapp/server/.env (Backend - DO NOT COMMIT)
```env
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
FRONTEND_URL=https://yourdomain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## ✅ Post-Deployment Checklist

### Frontend Verification
- [ ] Visit `https://yourdomain.com` - loads homepage
- [ ] Test navigation: `/login`, `/register`, `/cart`, `/orders`, `/rfq`
- [ ] Check browser console - no 404 errors for assets
- [ ] Verify HTTPS (green padlock)
- [ ] Test responsive design (mobile/tablet/desktop)

### Backend Verification
- [ ] Visit `https://yourdomain.com/api/health` - returns status
- [ ] Test registration: Create new account
- [ ] Test login: Login with created account
- [ ] Test protected routes: Cart, Orders, RFQ
- [ ] Check database connections
- [ ] Verify JWT token generation

### Database Verification
- [ ] User registration creates database entry
- [ ] Login retrieves correct user data
- [ ] Cart operations work (add/update/remove)
- [ ] Orders are created successfully
- [ ] RFQ submissions saved

### Performance Verification
- [ ] Page load time < 3 seconds
- [ ] All images load properly
- [ ] No console errors
- [ ] API response time < 1 second

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem: 404 on page refresh**
- **Solution:** Ensure `.htaccess` is uploaded and mod_rewrite is enabled

**Problem: API calls fail**
- **Solution:** Check `VITE_API_URL` in environment variables
- Verify CORS settings in backend
- Check browser console for exact error

**Problem: White screen / blank page**
- **Solution:** Check browser console for errors
- Verify all files uploaded from `dist/`
- Check file permissions (644 for files, 755 for directories)

### Backend Issues

**Problem: Node.js app won't start**
- **Solution:** Check error logs in Hostinger Node.js panel
- Verify `package.json` has correct start script
- Ensure all dependencies installed

**Problem: Database connection fails**
- **Solution:** Verify `DATABASE_URL` format
- Check database credentials
- Test connection from Hostinger SSH

**Problem: 502 Bad Gateway**
- **Solution:** Node.js app crashed or not running
- Check logs for error details
- Restart application from Hostinger panel

### CORS Issues
If frontend can't reach backend:

**Backend (server/src/index.js or server.js):**
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## 🔄 Update/Redeploy Process

### Frontend Updates
```powershell
cd c:\SS\myapp
git pull origin main
npm install
npm run build
# Upload myapp/dist/* to Hostinger public_html
```

### Backend Updates
```bash
# Via SSH
cd /home/username/domains/yourdomain.com/api
git pull origin main
npm install --production
# Restart app from Hostinger Node.js panel
```

---

## 📊 Monitoring & Maintenance

### Regular Checks
- [ ] Weekly: Check application logs
- [ ] Monthly: Update dependencies (`npm update`)
- [ ] Monthly: Review database size
- [ ] Quarterly: Update Node.js version

### Backup Strategy
- [ ] Daily: Database backups (Supabase auto-backup or Hostinger phpPgAdmin)
- [ ] Weekly: Full project backup
- [ ] Keep 3 recent backups

### Performance Optimization
- [ ] Enable Cloudflare (free CDN via Hostinger)
- [ ] Optimize images (use WebP format)
- [ ] Enable Gzip compression (already in .htaccess)
- [ ] Monitor bundle size (`npm run build` warnings)

---

## 🆘 Support Resources

- **Hostinger Knowledge Base:** https://support.hostinger.com
- **Hostinger Live Chat:** Available 24/7 in hPanel
- **Community Forum:** https://community.hostinger.com
- **Node.js Hosting Guide:** https://support.hostinger.com/en/articles/5672524-how-to-set-up-a-node-js-application

---

## 🔐 Security Best Practices

1. **Never commit .env files** to Git
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** (free SSL from Hostinger)
4. **Keep dependencies updated** (`npm audit fix`)
5. **Use environment variables** for all secrets
6. **Enable Hostinger firewall** in security settings
7. **Regular database backups**
8. **Monitor error logs** for suspicious activity

---

## 📝 Domain Configuration

### Primary Domain Setup
1. Go to Hostinger **Domains** section
2. Point domain to Hostinger nameservers
3. Wait for DNS propagation (up to 24 hours)

### Subdomain for API (Optional)
1. Create subdomain: `api.yourdomain.com`
2. Point to Node.js application directory
3. Update frontend `VITE_API_URL=https://api.yourdomain.com`

---

**Last Updated:** March 6, 2026  
**Version:** 1.0  
**Maintained by:** Sai Scientifics Development Team
