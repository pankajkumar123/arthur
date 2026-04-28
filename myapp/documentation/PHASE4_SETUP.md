# Phase 4 Setup & Testing Guide

**Status**: Prerequisites setup incomplete  
**Last Updated**: February 16, 2026

---

## Prerequisites Checklist

Before testing Phase 4, ensure all of the following are complete:

- [x] ✅ **Dependencies Installed**: razorpay, nodemailer
- [x] ✅ **Database Migration**: payment_logs table SQL created
- [x] ✅ **Environment Configuration**: .env created with test values
- [ ] ⏳ **PostgreSQL Running**: Database server must be running
- [ ] ⏳ **Backend Server**: Express.js server listening on port 4000
- [ ] ⏳ **Razorpay Account**: Create test account (optional, for real testing)
- [ ] ⏳ **Gmail App Password**: Generate for email notifications

---

## Step 1: Start PostgreSQL Database

### Option A: Docker (Recommended)

**Prerequisites**: Docker & Docker Desktop installed

```bash
cd Database
docker compose up -d postgres
```

Wait for container to be healthy (check logs):
```bash
docker compose logs postgres
```

Expected output:
```
postgres_1 | LOG: database system is ready to accept connections
```

### Option B: Local PostgreSQL Installation

**Prerequisites**: PostgreSQL installed locally

1. Ensure PostgreSQL service is running:
   - **Windows**: `Services` → Find `PostgreSQL` → Start
   - **macOS**: `brew services start postgresql`
   - **Linux**: `sudo service postgresql start`

2. Verify connection:
```bash
psql -U postgres -h localhost
```

If connected, type `\q` to exit.

### Option C: Alternative Docker

If Docker Desktop isn't running, try WSL 2 with Docker:
```bash
wsl --install
# Then in WSL terminal:
docker compose up -d postgres
```

---

## Step 2 Create Database & Tables

### Run Payment Logs Migration

```bash
cd server
node scripts/run-payment-migration.js
```

**Expected output**:
```
✓ Database connected
✓ Payment logs table created successfully
✓ Indexes created
✓ Views created
```

### Verify Tables Created

```bash
psql -U postgres -d myapp -c "\dt payment"
```

Should show:
```
        List of relations
 Schema |      Name      | Type  | Owner
--------+----------------+-------+----------
 public | payment_logs   | table | postgres
```

---

## Step 3: Verify Database Connection in .env

Check `.env` file (server/.env):

```dotenv
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=postgres

# Payment Gateway (Razorpay) - REQUIRED for Phase 4
RAZORPAY_KEY_ID=rzp_test_1234567890123456
RAZORPAY_KEY_SECRET=test_secret_1234567890123456
RAZORPAY_WEBHOOK_SECRET=webhook_secret_1234567890123456

# Email Configuration - OPTIONAL (can test without)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=Sai Scientifics <your-email@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## Step 4: Start Backend Server

```bash
cd server
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

**Expected output**:
```
Server running on port 4000
Database connection pool initialized
✓ Connected to PostgreSQL
```

---

## Step 5: Create Test User & Order

### 5.1: Register a Test Account

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "fullName": "Test User",
    "phone": "9876543210"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token** as `TEST_TOKEN` for next requests.

### 5.2: Create a Test Order

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "9876543210",
    "address": "123 Industrial Area",
    "city": "Gurgaon",
    "state": "Haryana",
    "pincode": "122003",
    "payment_method": "prepaid",
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price": 1200.00
      }
    ],
    "total_amount": 2544.00
  }'
```

**Response**:
```json
{
  "success": true,
  "orderId": 5,
  "status": "pending"
}
```

**Save the orderId** (5) for payment testing.

---

## Step 6: Test Phase 4 Payment Endpoints

### 6.1: Create Razorpay Order

```bash
curl -X POST http://localhost:4000/api/payment/create-order \
  -H "Authorization: Bearer TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 5
  }'
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "razorpayOrderId": "order_L9QXcOiLLBrtMa",
  "amount": 254400,
  "currency": "INR",
  "key": "rzp_test_1234567890123456",
  "message": "Order created successfully"
}
```

**Save**: 
- `razorpayOrderId` = order_L9QXcOiLLBrtMa
- `amount` = 254400 paise

### 6.2: Get Payment Status

```bash
curl -X GET http://localhost:4000/api/payment/status/5 \
  -H "Authorization: Bearer TEST_TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "orderId": 5,
  "orderStatus": "pending",
  "paymentStatus": "pending"
}
```

### 6.3: Get Invoice

```bash
curl -X GET http://localhost:4000/api/payment/invoice/5 \
  -H "Authorization: Bearer TEST_TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "INV-1708119885-5",
    "orderId": 5,
    "totalAmount": 2544.00,
    "items": [...],
    "customerName": "Test User"
  }
}
```

---

## Step 7: Test Frontend Payment Flow

### 7.1: Open Frontend

Navigate to: `http://localhost:5173/`

**OR** if using different port:
```bash
cd myapp
npm run dev
```

### 7.2: Add Items to Cart

1. Browse products
2. Click "Add to Cart" on 2-3 products
3. Verify items appear in cart

### 7.3: Proceed to Checkout

1. Click "Checkout" button in cart
2. Fill address form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Phone: "9876543210"
   - Address: "123 Industrial Area"
   - City: "Gurgaon"
   - State: "Haryana"
   - Pincode: "122003"
3. Click "Place Order"

**Expected**: Redirects to Payment.html?orderId=5

### 7.4: Test Razorpay Checkout

1. Page displays order summary
2. Click "Pay Now" button
3. Razorpay modal opens
4. Use test card: **4111 1111 1111 1111**
5. Enter any future expiry: **12/25**
6. Enter any 3-digit CVV: **123**
7. Click Pay

**Expected**: 
- Payment processes
- Modal closes
- Redirects to PaymentSuccess.html
- Shows "Order Confirmed" message

---

## Step 8: Verify Database Records

### Check Payment Logs Table

```bash
psql -U postgres -d myapp -c "SELECT * FROM payment_logs LIMIT 1;"
```

### Check Order Status

```bash
psql -U postgres -d myapp -c "SELECT id, status, payment_status FROM orders WHERE id = 5;"
```

Should show:
```
 id | status    | payment_status
----+-----------+----------------
  5 | confirmed | success
```

---

## Testing Checklist

Once database is running and backend is started, systematically test:

### API Tests (curl/Postman)
- [ ] POST /api/payment/create-order → 200 OK
- [ ] GET /api/payment/status/:orderId → 200 OK
- [ ] GET /api/payment/invoice/:orderId → 200 OK
- [ ] Error handling (invalid order, wrong user)

### Frontend Tests (Browser)
- [ ] Add items to cart
- [ ] Fill checkout form
- [ ] Create order (pending status)
- [ ] Payment.html loads with order details
- [ ] Pay Now button visible
- [ ] Razorpay modal opens/closes
- [ ] PaymentSuccess.html shows after payment
- [ ] Order status updates to "confirmed"

### Database Tests
- [ ] payment_logs table has entry
- [ ] order status = "confirmed"
- [ ] transaction_id recorded
- [ ] Indexes working (query fast)

### Error Handling Tests
- [ ] Invalid order ID → 404 error
- [ ] Skip payment → order stays "pending"
- [ ] Fail payment → error shown to user
- [ ] Already paid → can't pay again

---

## Troubleshooting

### Issue: Database Connection Refused

**Cause**: PostgreSQL not running  
**Solution**: 
1. Start PostgreSQL (Windows Services or Docker)
2. Test connection: `psql -U postgres` 
3. If prompts for password, use: `postgres`

### Issue: Tables Already Exist

If tables already exist from previous run, that's OK!  
**To reset database** (warning: deletes all data):
```bash
psql -U postgres -d myapp -c "DROP TABLE IF EXISTS payment_logs CASCADE;"
node scripts/run-payment-migration.js
```

### Issue: Razorpay Modal Not Opening

**Cause**: Frontend not loading Razorpay script  
**Solution**: 
1. Check browser console (F12) for errors
2. Verify FRONTEND_URL in .env is correct
3. Verify /api/payment/create-order returns success

### Issue: Email Not Sending

**Cause**: Gmail app password not configured  
**Solution**:
1. Skip email testing for now (optional feature)
2. Check error logs: `tail -f error.log`
3. Use [Gmail App Passwords](https://myaccount.google.com/apppasswords)

### Issue: Port 5432 Already in Use

**Cause**: Another PostgreSQL instance running  
**Solution**:
```bash
# Find process using port 5432
netstat -ano | findstr :5432
# Kill process (replace PID)
taskkill /PID <PID> /F
```

---

## Success Indicators

✅ **Phase 4 is working correctly when**:

1. **Backend starts without errors**
2. **Payment order creation succeeds** (POST /api/payment/create-order → 200)
3. **Frontend loads Payment.html** with order details
4. **Razorpay test card** processes (4111 1111 1111 1111)
5. **PaymentSuccess.html** displays after payment
6. **Database records** created (payment_logs table)
7. **Order status** updates to "confirmed" after payment
8. **No console errors** in browser or backend logs

---

## Next Steps After Phase 4 Testing

### If All Tests Pass ✅
Proceed to **Phase 5: Email & Notifications**
- Advanced email templates
- SMS notifications with Twilio
- WhatsApp alerts
- PDF invoice generation

### If Issues Exist ⚠️
**Debug Steps**:
1. Check all error logs (server/error.log)
2. Verify `.env` configuration
3. Restart backend server
4. Clear browser cache (Ctrl+Shift+Delete)
5. Check database connectivity

---

## Database Schema Reference

### payment_logs Table

```sql
CREATE TABLE payment_logs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  customer_id INTEGER NOT NULL REFERENCES customer_user(id),
  
  -- Razorpay
  razorpay_order_id VARCHAR(50) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(50) UNIQUE,
  razorpay_signature VARCHAR(255),
  
  -- Amount (in paise)
  amount_paise INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_status VARCHAR(20) DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  
  -- Indexes on frequently queried columns
  -- idx_payment_logs_order_id
  -- idx_payment_logs_customer_id
  -- idx_payment_logs_payment_status
);
```

---

## Additional Commands

### View Backend Logs
```bash
tail -f server/app.log        # See all logs
tail -f server/error.log      # See only errors
```

### View Database Logs
```bash
docker logs myapp-postgres    # If using Docker
```

### Reset Everything (Full Wipe)
```bash
# Drop database
psql -U postgres -c "DROP DATABASE myapp;"

# Recreate database
psql -U postgres -c "CREATE DATABASE myapp;"

# Rerun migrations
cd server
node scripts/run-payment-migration.js
```

---

**Status**: Ready for Phase 4 Testing  
**Dependencies**: razorpay ✅, nodemailer ✅, PostgreSQL ⏳ (needs to start)  
**Next Action**: Start PostgreSQL → Run migration → Start backend → Begin testing

