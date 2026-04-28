# Backend Infrastructure - Phase 1 Complete

## Overview
Phase 1 of the production-ready backend infrastructure has been completed. This phase focused on building a robust foundation with industry-standard security, logging, validation, and authentication.

## What's Been Built

### 1. Infrastructure Layer ✅

#### Database Layer (`server/src/db.js`)
- **Connection Pooling**: Max 20 concurrent connections, 30s idle timeout
- **Transaction Support**: Helper function for atomic operations
- **Health Checks**: Monitor database connectivity
- **Graceful Shutdown**: Proper connection cleanup
- **Query Logging**: Performance tracking in development
- **SSL Support**: Enabled for production environments

#### Logging System (`server/src/utils/logger.js`)
- **File Logging**: Writes to `logs/app.log` and `logs/error.log`
- **Console Output**: Color-coded for different log levels (red, yellow, cyan, gray)
- **Request/Response Logging**: Tracks HTTP requests with duration
- **Metadata Support**: JSON metadata for structured logging
- **Environment-Aware**: Debug logs only in development

#### Validation Utilities (`server/src/utils/validator.js`)
- **Email Validation**: RFC-compliant, lowercase, trimmed
- **Phone Validation**: Indian mobile format (+91 optional, 10 digits)
- **Password Validation**: Min 8 chars, requires uppercase/lowercase/number
- **GSTIN Validation**: Indian GST tax number format
- **Amount Validation**: Positive numbers, decimal support
- **Pincode Validation**: 6-digit Indian postal codes
- **XSS Prevention**: `sanitizeString()` escapes HTML entities
- **Registration/Login Validators**: Combine multiple checks with error objects

### 2. Security & Authentication ✅

#### Authentication Middleware (`server/src/middleware/auth.js`)
- **JWT Token Verification**: Stateless authentication with `Bearer` tokens
- **Optional Auth**: For routes that work with/without login
- **Role-Based Access**: `requireAdmin()` for admin-only routes
- **Rate Limiting**: 100 requests per 15 minutes per user
- **CORS Configuration**: Origin whitelist from environment
- **Security Headers**: X-Frame-Options, CSP, HSTS, X-XSS-Protection
- **Body Size Validation**: Prevents large payload attacks (2MB limit)

#### Error Handling (`server/src/middleware/errorHandler.js`)
- **Custom Error Classes**: AppError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError, ConflictError
- **Error Formatter**: Consistent JSON response format
- **Database Error Handling**: Specific handling for PostgreSQL errors (unique violations, foreign key violations, etc.)
- **JWT Error Handling**: Token expired, invalid token
- **Process Error Handlers**: Uncaught exceptions, unhandled promise rejections
- **Async Wrapper**: `asyncHandler()` for clean async/await error handling

### 3. Authentication Routes ✅

#### Enhanced Auth Routes (`server/src/routes/auth.js`)
Replaced session-based auth with JWT tokens:

**POST /api/auth/register**
- Validates: name (2+ chars), email (RFC), password (8+ chars), phone (Indian format)
- Hashes password with bcrypt (10 rounds)
- Returns: JWT token + user data
- Logs: Registration attempts with validation errors

**POST /api/auth/login**
- Validates: email + password
- Verifies password with bcrypt
- Returns: JWT token + user data
- Logs: Login attempts, invalid credentials

**POST /api/auth/logout** (Protected)
- Requires: Valid JWT token
- Logs: Logout events
- Note: JWT is stateless, so this is mainly for logging

**GET /api/auth/me** (Protected)
- Returns: Fresh user data from database
- Requires: Valid JWT token

**PUT /api/auth/profile** (Protected)
- Updates: fullName, phone
- Validates: Input before update
- Logs: Profile changes

**POST /api/auth/change-password** (Protected)
- Validates: Current password before changing
- Hashes: New password with bcrypt
- Logs: Password change events

### 4. Main Server ✅

#### Enhanced Server (`server/src/index.js`)
- **Security First**: Helmet.js + custom security headers applied before routes
- **CORS**: Origin whitelist configuration
- **Request Logging**: All HTTP requests logged with duration
- **Health Check**: `/api/health` endpoint with database status
- **Error Handling**: 404 handler + centralized error middleware
- **Graceful Shutdown**: Handles SIGTERM/SIGINT, closes DB connections
- **Force Timeout**: 30-second timeout for shutdown

### 5. Database Scripts ✅

#### Initialization Script (`server/scripts/init-db.js`)
- Checks if tables exist
- Runs migration files (V1__init_schema.sql)
- Interactive prompts before dropping existing tables
- Usage: `npm run db:init`

#### Seed Script (`server/scripts/seed.js`)
- Checks existing data
- Runs seed files (V2__seed_data.sql or V5__seed_data.sql)
- Interactive prompts before clearing data
- Verifies seeded records
- Usage: `npm run db:seed`

### 6. Configuration ✅

#### Environment Variables (`.env`)
Complete production configuration:
- Database connection (PostgreSQL)
- JWT configuration (secret, expiration)
- CORS whitelist
- Email settings (Gmail SMTP)
- Payment gateway (Razorpay test keys)
- WhatsApp notifications (Twilio)
- Company information (for invoices)
- Rate limiting settings

#### Package Dependencies (`package.json`)
Added 5 new dependencies:
- `bcryptjs@^2.4.3` - Password hashing
- `helmet@^7.1.0` - Security headers
- `jsonwebtoken@^9.0.2` - JWT token generation/verification
- `validator@^13.11.0` - Email/input validation

## Project Structure

```
server/
├── .env                          # Development configuration
├── .env.example                  # Configuration template
├── package.json                  # Dependencies + scripts
├── scripts/
│   ├── init-db.js               # Database initialization
│   └── seed.js                  # Database seeding
├── src/
│   ├── index.js                 # Main server (enhanced)
│   ├── db.js                    # Database layer (enhanced)
│   ├── middleware/
│   │   ├── auth.js              # Authentication & security
│   │   └── errorHandler.js      # Error handling
│   ├── utils/
│   │   ├── logger.js            # Logging system
│   │   └── validator.js         # Input validation
│   └── routes/
│       └── auth.js              # Authentication routes (JWT)
└── logs/                         # Log files (auto-created)
    ├── app.log
    └── error.log
```

## Security Features Implemented

1. **Password Security**
   - Bcrypt hashing with 10 rounds
   - Never stores plain text passwords
   - Secure password comparison

2. **JWT Tokens**
   - Stateless authentication (no database sessions)
   - 7-day expiration (configurable)
   - Contains user ID, email, role

3. **Input Validation**
   - Email format validation (RFC-compliant)
   - Password strength requirements
   - Phone number format checking
   - XSS prevention with HTML escaping

4. **Rate Limiting**
   - 100 requests per 15 minutes per user
   - Prevents brute force attacks
   - In-memory tracking (can upgrade to Redis)

5. **Security Headers**
   - X-Frame-Options: DENY (prevents clickjacking)
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy (production)
   - Strict-Transport-Security (HSTS)

6. **Error Handling**
   - Detailed errors in development
   - Generic errors in production (no stack traces)
   - Logs all errors with context

## How to Use

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Database
Edit `server/.env` with your PostgreSQL credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/myapp
JWT_SECRET=your-32-char-random-string
```

### 3. Initialize Database
```bash
npm run db:init
```
This will:
- Create all tables (customer_user, product, cart, orders, etc.)
- Run migration files

### 4. Seed Database (Optional)
```bash
npm run db:seed
```
This will populate the database with:
- Sample products
- Categories
- Test users

### 5. Start Server
```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server will start on: `http://localhost:4000`

### 6. Test Endpoints

#### Health Check
```bash
curl http://localhost:4000/api/health
```

#### Register User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test1234",
    "phone": "+919876543210"
  }'
```

#### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

#### Get User Profile
```bash
# Replace YOUR_JWT_TOKEN with token from login/register
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Logging

All logs are written to:
- `server/logs/app.log` - All log levels
- `server/logs/error.log` - Errors only

Console output is color-coded:
- 🔴 RED: Errors
- 🟡 YELLOW: Warnings
- 🔵 CYAN: Info
- ⚪ GRAY: Debug (development only)

Example log format:
```
[2024-02-16T10:30:45.123Z] [INFO] User logged in successfully {"userId":1,"email":"test@example.com"}
```

## Error Responses

All errors follow consistent format:

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "statusCode": 400,
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

### Unauthorized (401)
```json
{
  "error": "Invalid email or password",
  "statusCode": 401
}
```

### Conflict (409)
```json
{
  "error": "Email already registered",
  "statusCode": 409
}
```

### Not Found (404)
```json
{
  "error": "Route not found",
  "statusCode": 404,
  "path": "/api/invalid-route"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error",
  "statusCode": 500
}
```

## Next Steps (Phase 2: API Integration)

Now that the infrastructure is complete, we can proceed with:

1. **Connect Frontend to Backend**
   - Update `myapp/api.js` to use `http://localhost:4000/api`
   - Replace localStorage auth with JWT tokens
   - Update all pages to use real API calls

2. **Implement Protected Routes**
   - Add `authenticateToken` middleware to protected routes
   - Update cart, orders, RFQ routes
   - Add admin-only routes with `requireAdmin`

3. **Catalog API**
   - Load products from database
   - Implement filters, sorting, pagination
   - Add product search

4. **Cart & Orders API**
   - Persistent cart in database
   - Order creation and tracking
   - Order history

5. **Testing**
   - Test all endpoints with Postman/curl
   - Verify authentication flow
   - Test error handling

## Troubleshooting

### Database Connection Errors
- Verify PostgreSQL is running: `pg_ctl status`
- Check credentials in `.env`
- Ensure database `myapp` exists: `createdb myapp`
- Test connection: `psql -U postgres -d myapp`

### JWT Token Errors
- Ensure `JWT_SECRET` is set in `.env`
- Check token format: `Bearer <token>`
- Verify token not expired (7 days default)

### CORS Errors
- Add frontend URL to `CORS_ORIGIN` in `.env`
- Ensure comma-separated for multiple origins
- Check browser console for specific CORS error

### Rate Limiting
- If locked out, wait 15 minutes
- Or restart server to clear in-memory limits
- Consider upgrading to Redis for production

## Performance Considerations

1. **Connection Pooling**: Max 20 connections, tune based on traffic
2. **Query Logging**: Disabled in production for performance
3. **Rate Limiting**: In-memory (not suitable for multi-server, use Redis)
4. **File Logging**: May need log rotation for high-traffic sites

## Security Checklist

✅ Passwords hashed with bcrypt  
✅ JWT tokens for stateless auth  
✅ Input validation on all user data  
✅ SQL injection prevention (parameterized queries)  
✅ XSS prevention (HTML escaping)  
✅ CSRF protection (SameSite cookies if needed)  
✅ Rate limiting per user  
✅ Security headers (helmet.js)  
✅ CORS whitelist  
✅ Error messages don't leak sensitive info  
✅ Graceful shutdown handling  

## Notes

- This backend uses **JWT tokens** (stateless) instead of database sessions
- All passwords are hashed with **bcrypt** (10 rounds)
- Validation uses industry-standard **validator** library
- Security headers via **helmet.js**
- Error handling follows **Express best practices**
- Logging follows **structured logging** format
- Database queries use **parameterized statements** (no SQL injection)
- CORS configured for **specific origins** (not wildcard *)

## Support

For issues or questions:
1. Check logs in `server/logs/`
2. Verify environment variables in `.env`
3. Test database connection with health check
4. Review error messages for specific issues

---

**Phase 1 Status**: ✅ COMPLETE (100%)  
**Next Phase**: Phase 2 - API Integration & Frontend Connection
