# Frontend Configuration Guide

## API URL Configuration

The frontend automatically detects whether it's running in development or production and uses the appropriate API URL.

### Automatic Detection (Default)

- **Development** (localhost): `http://localhost:4000/api`
- **Production** (deployed): `https://saiscientifics-api.onrender.com/api`

The detection is done in [api.js](api.js) based on `window.location.hostname`.

### Manual Override

If you need to use a different API URL, you can set it before loading api.js:

```html
<script>
  window.API_BASE = 'https://your-custom-api-url.com/api';
</script>
<script src="api.js" defer></script>
```

### Environment-Specific URLs

**Development:**
- Running locally on `http://localhost:5173` or similar
- API calls go to `http://localhost:4000/api`

**Production:**
- Deployed on Vercel, Netlify, Render, etc.
- API calls go to `https://saiscientifics-api.onrender.com/api`

### Changed Files (v2.0)

The following files have been updated to support automatic environment detection:

1. **api.js** - Auto-detects environment and sets API_BASE
2. **Dashboard.js** - Now uses `window.API_BASE` instead of hardcoded localhost
3. **Cart.js** - Now uses `window.API_BASE` instead of hardcoded localhost

Other files (admin.js, javascript.js, grievance.js, WriteReview.js) already used the correct pattern.

### Verification

To verify the correct API URL is being used, open browser console and check:

```javascript
console.log('API Base:', window.API_BASE);
```

You should see:
- In development: `http://localhost:4000/api`
- In production: `https://saiscientifics-api.onrender.com/api`

### Troubleshooting

**Issue: API calls failing in production**
- **Check**: Open console, verify `window.API_BASE` shows production URL
- **Fix**: Ensure api.js is loaded before other scripts

**Issue: Still using localhost in production**
- **Check**: Browser console for `window.API_BASE`
- **Fix**: Clear browser cache and hard reload (Ctrl+Shift+R)

**Issue: Need different production URL**
- **Fix**: Update the production URL in [api.js](api.js) line 11

### Deployment Checklist

- [x] api.js auto-detects environment
- [x] Dashboard.js uses dynamic API_BASE
- [x] Cart.js uses dynamic API_BASE
- [x] All HTML files load api.js first
- [x] Backend deployed at https://saiscientifics-api.onrender.com
- [ ] Frontend deployed (Vercel/Netlify/Render)
- [ ] Test production API calls
- [ ] Verify CORS is configured for frontend domain

---

**Last Updated**: 2026-02-22  
**Version**: 2.0
