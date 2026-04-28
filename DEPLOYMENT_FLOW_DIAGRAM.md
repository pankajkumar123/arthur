# 🗺️ Deployment Flow Diagram

Visual guide to deploying your full-stack application.

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐                                    ┌──────────────┐
│              │                                    │              │
│    USER'S    │                                    │   GITHUB     │
│   BROWSER    │                                    │  REPOSITORY  │
│              │                                    │              │
└──────┬───────┘                                    └───────┬──────┘
       │                                                    │
       │ HTTPS                                              │
       │                                                    │
       ▼                                                    │
┌──────────────┐                                           │
│              │                                           │
│   NETLIFY    │◄──────────────────────────────────────────┘
│     CDN      │          Auto-deploy on push
│  (Frontend)  │
│              │
└──────┬───────┘
       │
       │ API Calls (HTTPS)
       │
       ▼
┌──────────────┐                                    ┌──────────────┐
│              │                                    │              │
│    RENDER    │◄───────────────────────────────────┤   GITHUB     │
│   (Backend)  │          Auto-deploy on push      │  REPOSITORY  │
│              │                                    │              │
└──────┬───────┘                                    └──────────────┘
       │
       │ PostgreSQL
       │ Connection
       │
       ▼
┌──────────────┐
│              │
│   SUPABASE   │
│  (Database)  │
│  PostgreSQL  │
│              │
└──────────────┘
```

---

## 🔄 Deployment Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT SEQUENCE                          │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: PREPARE REPOSITORIES
│
├─► Split monorepo into two:
│   ├─► SS-Backend  (myapp/server/)
│   └─► SS-Frontend (myapp/)
│
▼

PHASE 2: DEPLOY BACKEND (Render)
│
├─► Create Render account
├─► Connect SS-Backend repo
├─► Configure build settings
├─► Add environment variables:
│   ├─► DATABASE_URL (Supabase)
│   ├─► SUPABASE credentials
│   ├─► JWT_SECRET
│   └─► CORS_ORIGIN=*
│
├─► Deploy
│
├─► Get backend URL:
│   └─► https://saiscientifics-backend.onrender.com
│
└─► Verify health endpoints ✓
    ├─► /api/health
    └─► /api/health/db
    │
    ▼

PHASE 3: DEPLOY FRONTEND (Netlify)
│
├─► Create Netlify account
├─► Connect SS-Frontend repo
├─► Configure build settings
├─► Add environment variable:
│   └─► VITE_API_URL=<backend-url-from-phase-2>
│
├─► Deploy
│
├─► Get frontend URL:
│   └─► https://saiscientifics.netlify.app
│
└─► Verify site loads ✓
    │
    ▼

PHASE 4: UPDATE CORS (Render)
│
├─► Return to Render dashboard
├─► Update CORS_ORIGIN:
│   └─► From: *
│   └─► To: https://saiscientifics.netlify.app
│
└─► Service auto-redeploys ✓
    │
    ▼

PHASE 5: VERIFY & TEST
│
├─► Frontend loads correctly ✓
├─► API calls reach backend ✓
├─► No CORS errors ✓
└─► Database connection works ✓
    │
    ▼

🎉 DEPLOYMENT COMPLETE!
```

---

## 🔐 Environment Variables Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 ENVIRONMENT CONFIGURATION                        │
└─────────────────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT
│
├─► Backend (.env.local):
│   ├─► DATABASE_URL=postgresql://localhost...
│   ├─► JWT_SECRET=...
│   └─► CORS_ORIGIN=http://localhost:5173
│
└─► Frontend (.env):
    └─► VITE_API_URL=http://localhost:4000
    │
    ▼

PRODUCTION DEPLOYMENT
│
├─► Render (Backend Environment):
│   ├─► NODE_ENV=production
│   ├─► PORT=4000
│   ├─► DATABASE_URL=postgresql://...supabase.co...
│   ├─► SUPABASE_URL=https://xxxxx.supabase.co
│   ├─► SUPABASE_ANON_KEY=eyJhbGci...
│   ├─► SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
│   ├─► JWT_SECRET=<32-char-random>
│   ├─► JWT_EXPIRES_IN=7d
│   └─► CORS_ORIGIN=https://your-site.netlify.app
│
└─► Netlify (Frontend Environment):
    └─► VITE_API_URL=https://your-backend.onrender.com

```

---

## 📡 Request Flow (Production)

```
┌─────────────────────────────────────────────────────────────────┐
│                    API REQUEST LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────┘

1. User Action
   └─► User clicks "Login" button in React app

2. Frontend Processing
   └─► src/services/api.js
       └─► axios.post('/api/auth/login', credentials)
           └─► URL: import.meta.env.VITE_API_URL + '/api/auth/login'

3. Request to Backend
   └─► HTTPS request:
       └─► https://saiscientifics-backend.onrender.com/api/auth/login

4. CORS Check (Render)
   └─► Backend checks Origin header
       └─► Allowed? Check CORS_ORIGIN env var
           └─► ✓ Match: Continue
           └─► ✗ Reject: CORS error

5. Authentication Middleware
   └─► Express middleware chain
       └─► helmet (security headers)
       └─► cors (origin check)
       └─► body-parser (parse JSON)

6. Route Handler
   └─► src/routes/auth.js
       └─► POST /api/auth/login
           └─► Validate credentials
           └─► Query database (Supabase)

7. Database Query (Supabase)
   └─► PostgreSQL connection:
       └─► SELECT * FROM users WHERE email=?
           └─► SSL connection to Supabase

8. Response Processing
   └─► Generate JWT token
       └─► Sign with JWT_SECRET
       └─► Set expiration (JWT_EXPIRES_IN)

9. Response to Frontend
   └─► JSON response:
       {
         "token": "eyJhbGci...",
         "user": {...}
       }

10. Frontend Receives Response
    └─► Axios interceptor:
        └─► Store token in localStorage
        └─► Update AuthContext
        └─► Redirect to dashboard

11. Subsequent Requests
    └─► Request interceptor adds:
        └─► Authorization: Bearer eyJhbGci...
```

---

## 🔄 Continuous Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│               AUTOMATED DEPLOYMENT PIPELINE                      │
└─────────────────────────────────────────────────────────────────┘

BACKEND UPDATES
│
├─► Developer pushes code:
│   └─► git push origin main (SS-Backend)
│
├─► GitHub webhook triggers Render:
│   └─► Render starts build process
│       ├─► Clone repository
│       ├─► npm install
│       ├─► npm start
│       └─► Health check
│
├─► Deployment time: 2-4 minutes
│
└─► Service live with new code ✓
    │
    ▼

FRONTEND UPDATES
│
├─► Developer pushes code:
│   └─► git push origin main (SS-Frontend)
│
├─► GitHub webhook triggers Netlify:
│   └─► Netlify starts build process
│       ├─► Clone repository
│       ├─► npm install
│       ├─► npm run build
│       ├─► Deploy to CDN
│       └─► Cache invalidation
│
├─► Deployment time: 1-3 minutes
│
└─► Site live with new code ✓
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

Layer 1: TRANSPORT SECURITY
│
├─► HTTPS everywhere (automatic)
│   ├─► Netlify: Auto SSL certificate
│   └─► Render: Auto SSL certificate
│
└─► TLS 1.2+ encryption
    │
    ▼

Layer 2: CORS PROTECTION
│
├─► Backend checks Origin header
├─► Only allows: https://saiscientifics.netlify.app
└─► Rejects all other origins
    │
    ▼

Layer 3: AUTHENTICATION
│
├─► JWT tokens (Bearer scheme)
├─► Tokens expire after 7 days
├─► Secret key stored in env vars
└─► Tokens validated on each request
    │
    ▼

Layer 4: DATABASE SECURITY
│
├─► SSL connection required
├─► Prepared statements (no SQL injection)
├─► Password hashing with bcrypt
└─► Supabase Row Level Security (future)
    │
    ▼

Layer 5: APPLICATION SECURITY
│
├─► Helmet.js security headers
├─► Input validation
├─► Rate limiting (future)
└─► Environment variables (no hardcoded secrets)
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

USER REGISTRATION FLOW
│
├─► User fills form
│   └─► Email, Password, Name
│
├─► Frontend validation
│   └─► Email format, password strength
│
├─► POST /api/auth/register
│   └─► HTTPS → Render backend
│
├─► Backend validation
│   └─► Check email not exists
│
├─► Hash password
│   └─► bcrypt.hash(password, 10)
│
├─► INSERT INTO users
│   └─► Supabase PostgreSQL
│
├─► Generate JWT
│   └─► jwt.sign({userId}, JWT_SECRET)
│
└─► Return token to frontend
    └─► Store in localStorage
    │
    ▼

PRODUCT BROWSING FLOW
│
├─► User visits products page
│
├─► GET /api/products
│   └─► HTTPS → Render backend
│
├─► Backend queries database
│   └─► SELECT * FROM products
│       └─► JOIN product_images
│
├─► Supabase returns data
│   └─► Array of products
│
├─► Backend formats response
│   └─► JSON with pagination
│
└─► Frontend renders products
    └─► React components
    │
    ▼

CHECKOUT FLOW
│
├─► User adds items to cart
│   └─► POST /api/cart/add
│
├─► User proceeds to checkout
│   └─► POST /api/orders/create
│
├─► Backend creates order
│   └─► INSERT INTO orders
│       └─► INSERT INTO order_items
│
├─► Payment processing
│   └─► POST /api/payment/create
│       └─► Razorpay integration
│
├─► Payment verification
│   └─► POST /api/payment/verify
│       └─► Update order status
│
└─► Send confirmation
    └─► Email notification
    └─► SMS tracking update
```

---

## 🎯 Monitoring & Health Checks

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEALTH CHECK SYSTEM                           │
└─────────────────────────────────────────────────────────────────┘

BACKEND HEALTH ENDPOINTS
│
├─► /api/health
│   └─► Response:
│       {
│         "status": "ok",
│         "timestamp": "2026-03-01T12:00:00Z",
│         "uptime": 3600
│       }
│
└─► /api/health/db
    └─► Response:
        {
          "status": "ok",
          "database": "connected",
          "version": "PostgreSQL 17.6",
          "latency": "45ms"
        }

MONITORING CHECKS
│
├─► Render Dashboard
│   ├─► CPU usage
│   ├─► Memory usage
│   ├─► Request count
│   └─► Error rate
│
└─► Netlify Dashboard
    ├─► Build status
    ├─► Bandwidth usage
    ├─► Deploy frequency
    └─► Error logs

EXTERNAL MONITORING (Optional)
│
└─► UptimeRobot (free)
    └─► Ping /api/health every 5 minutes
        └─► Alert if down
```

---

## 🚀 Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                  PERFORMANCE ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────┘

FRONTEND (Netlify CDN)
│
├─► Global edge network
│   └─► Served from nearest location
│
├─► Static asset caching
│   └─► /assets/*: 1 year cache
│
├─► Gzip compression (automatic)
│   └─► JS: 465KB → ~120KB
│   └─► CSS: 17KB → ~5KB
│
└─► HTTP/2 + Push
    │
    ▼

BACKEND (Render)
│
├─► Connection pooling
│   └─► Reuse PostgreSQL connections
│
├─► Response caching (future)
│   └─► Redis for frequent queries
│
└─► Load balancing (Starter plan+)
    │
    ▼

DATABASE (Supabase)
│
├─► Indexed queries
│   └─► Primary keys, foreign keys
│
├─► Connection pooling (automatic)
│   └─► PgBouncer
│
└─► Optimized queries
    └─► JOINs instead of N+1
```

---

**Use these diagrams for reference during deployment! 📚**
