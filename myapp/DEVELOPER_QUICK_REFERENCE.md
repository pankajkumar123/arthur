# Developer Quick Reference

## 🚀 Quick Start

```bash
# Frontend
cd myapp
npm install
npm run dev          # http://localhost:5173

# Backend
cd myapp/server
npm install
npm run dev          # http://localhost:4000

# Build
cd myapp
npm run build        # Output: dist/
```

---

## 📁 Where to Find Things

| What | Where |
|------|-------|
| React components | `src/components/ui/` |
| Pages | `src/pages/` |
| API calls | `src/services/api.js` |
| Auth logic | `src/context/AuthContext.jsx` |
| Utilities | `src/lib/utils.js` |
| Global styles | `src/index.css` |
| Tailwind config | `tailwind.config.js` |
| Backend routes | `server/src/routes/` |
| Database connection | `server/src/db.js` |
| Environment vars | `server/.env.local` |

---

## 🎨 Common Tailwind Classes

```javascript
// Layout
className="max-w-7xl mx-auto p-8"
className="flex items-center justify-between"
className="grid grid-cols-1 md:grid-cols-3 gap-6"

// Spacing
className="mb-4 mt-8 px-6 py-4"

// Typography
className="text-4xl font-bold"
className="text-sm text-muted-foreground"

// Colors
className="bg-primary text-primary-foreground"
className="bg-card border rounded-lg"

// Interactive
className="hover:bg-accent hover:text-accent-foreground"
className="transition-colors duration-200"
```

---

## 🔧 Using Components

### Button
```javascript
import { Button } from '../components/ui/Button';

<Button onClick={handleClick}>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### API Calls
```javascript
import { api } from '../services/api';

// GET
const products = await api.getProducts({ limit: 10 });

// POST
const order = await api.createOrder({
  items: [...],
  total: 1000
});

// Error handling
try {
  const result = await api.submitRFQ(data);
} catch (error) {
  console.error('Failed:', error.message);
}
```

### Auth
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login({ email, password });
    if (result.success) {
      // Logged in!
    } else {
      // Show error: result.error
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.full_name}!</p>
      ) : (
        <Button onClick={handleLogin}>Login</Button>
      )}
    </div>
  );
}
```

---

## 🗄️ Database Queries

```javascript
// In backend routes
const { query } = require('../db');

// Simple query
const result = await query(
  'SELECT * FROM product WHERE status = $1 LIMIT $2',
  ['active', 10]
);

// Insert
const newUser = await query(
  'INSERT INTO app_user (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING *',
  [email, hash, name]
);

// Update
await query(
  'UPDATE customer_order SET status = $1 WHERE id = $2',
  ['shipped', orderId]
);
```

---

## 🔐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
```

### Backend (.env.local)
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
JWT_SECRET=your-secret
```

Access in code:
```javascript
// Frontend
const apiUrl = import.meta.env.VITE_API_URL;

// Backend
const dbUrl = process.env.DATABASE_URL;
```

---

## 🎯 Common Tasks

### Add New Page
1. Create `src/pages/MyPage.jsx`
2. Import in `App.jsx`: `import MyPage from './pages/MyPage'`
3. Use: `<MyPage />`

### Add New API Endpoint
1. Create route in `server/src/routes/myroute.js`
2. Add to `server/src/index.js`: `app.use('/api/my', myRoutes)`
3. Add method to `src/services/api.js`:
   ```javascript
   export const api = {
     // ...
     getMyData: () => apiClient.get('/api/my/data'),
   };
   ```

### Add New ShadCN Component
1. Copy from [ui.shadcn.com](https://ui.shadcn.com)
2. Save to `src/components/ui/ComponentName.jsx`
3. Import and use:
   ```javascript
   import { ComponentName } from '../components/ui/ComponentName';
   ```

### Style with Tailwind
```javascript
// Instead of CSS file
<div style={{ padding: '20px' }}>  ❌

// Use Tailwind
<div className="p-5">  ✅

// Responsive
<div className="p-4 md:p-8 lg:p-12">  ✅

// Hover states
<div className="hover:bg-accent">  ✅

// Combine with utils
<div className={cn("p-4", isActive && "bg-primary")}>  ✅
```

---

## 🐛 Debugging Tips

### Frontend not connecting to backend?
```javascript
// Check in browser console
console.log('API URL:', import.meta.env.VITE_API_URL);

// Check network tab
// Should see requests to http://localhost:4000
```

### Database connection issues?
```bash
cd server
node test-supabase.js

# Should show:
# ✅ Connected to PostgreSQL
# ✅ Database has 12 tables
```

### Tailwind styles not applying?
```bash
# Check postcss.config.js has:
# plugins: { '@tailwindcss/postcss': {} }

# Check index.css has:
# @import "tailwindcss";

# Restart dev server
npm run dev
```

### Build errors?
```bash
# Clear and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 📦 Package Issues

```bash
# Update all packages
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Reinstall everything
rm -rf node_modules package-lock.json
npm install
```

---

## 🔗 Useful Links

- [Tailwind Docs](https://tailwindcss.com/docs)
- [ShadCN UI](https://ui.shadcn.com)
- [Axios Docs](https://axios-http.com/docs/intro)
- [React Docs](https://react.dev)
- [Vite Docs](https://vite.dev)
- [Supabase Docs](https://supabase.com/docs)

---

## 💡 Pro Tips

1. **Use `cn()` for conditional classes**:
   ```javascript
   import { cn } from '../lib/utils';
   className={cn("base-class", isActive && "active-class")}
   ```

2. **Destructure API responses**:
   ```javascript
   const { data } = await api.getProducts();
   setProducts(data);
   ```

3. **Use Tailwind config for consistency**:
   ```javascript
   // tailwind.config.js
   theme: {
     extend: {
       colors: { brand: '#1d2433' }
     }
   }
   
   // Use in components
   className="bg-brand"
   ```

4. **Environment-specific behavior**:
   ```javascript
   const isDev = import.meta.env.DEV;
   if (isDev) {
     console.log('Debug info');
   }
   ```

5. **Loading states with Axios**:
   ```javascript
   const [loading, setLoading] = useState(false);
   
   const loadData = async () => {
     setLoading(true);
     try {
       const data = await api.getData();
       setData(data);
     } finally {
       setLoading(false);
     }
   };
   ```
