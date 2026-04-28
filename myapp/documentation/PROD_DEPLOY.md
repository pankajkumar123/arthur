# Production Deployment (Recommended Stack)

This guide assumes:
- Frontend: Cloudflare Pages
- Backend API: Render
- Database: Supabase Postgres
- Payments: Razorpay

## 1) Create service accounts
- Cloudflare Pages project for frontend.
- Render web service for the API.
- Supabase project for Postgres.
- Razorpay account for payments.

## 2) Configure the database
- In Supabase, create a new project and copy the connection string.
- Update Database/flyway.conf with Supabase credentials:
  - flyway.url=jdbc:postgresql://HOST:5432/DBNAME
  - flyway.user=USER
  - flyway.password=PASSWORD
- Run Flyway migrations once (locally):

```bash
cd Database
docker compose run --rm flyway
```

## 3) Deploy the backend (Render)
- Create a new Render Web Service.
- Root directory: myapp/server
- Build command: npm install
- Start command: npm start
- Set environment variables:
  - DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
  - CORS_ORIGIN=https://your-frontend-domain
  - UPLOAD_DIR=uploads
  - PORT=4000
  - RAZORPAY_KEY_ID=your_key
  - RAZORPAY_KEY_SECRET=your_secret

## 4) Deploy the frontend (Cloudflare Pages)
- Build command: npm install
- Output directory: myapp (static files)
- Set your API base in api.js or add a small inline script to define API_BASE.

Example in HTML head:
```html
<script>
  window.API_BASE = 'https://your-api-domain/api';
</script>
```

## 5) Payments (Razorpay)
- Implement order creation endpoint and webhook handler.
- Store payment status in the database.
- Use Razorpay test keys for verification.

## 6) Verify end-to-end
- Signup/login
- RFQ submit + upload
- Cart checkout
- Order tracking
- Reviews and grievances
- Admin dashboard data visibility

## 7) Go live
- Add custom domain + HTTPS.
- Set up monitoring and backups.
- Rotate secrets and lock down admin access.
