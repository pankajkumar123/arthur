# Phase 5: Setup & Installation Guide

**Status**: Ready for Implementation  
**Prerequisites**: Phase 4 (Payments) completed  
**Setup Time**: 15-20 minutes

---

## Quick Start

### Step 1: Install Dependencies
```bash
cd server
npm install pdfkit twilio
```

### Step 2: Configure Environment Variables
Add to `.env`:
```dotenv
# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password
EMAIL_FROM=Sai Scientifics <your-email@gmail.com>

# SMS/WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=AC1234567890abcdef
TWILIO_AUTH_TOKEN=auth_token_here
TWILIO_PHONE_FROM=+14155238886
TWILIO_WHATSAPP_FROM=+14155238886

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 3: Run Database Migration
```bash
cd server
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../Database/migrations/V10__notifications.sql'),
      'utf8'
    );
    
    // Execute statements sequentially
    const statements = sql.split(';').map(s => s.trim()).filter(s => s);
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    
    console.log('✓ Phase 5 notification tables created');
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
"
```

### Step 4: Restart Backend Server
```bash
npm start
# or for development:
npm run dev
```

---

## Detailed Setup

### 1. Install Required Packages

#### PDFKit (for PDF invoices)
```bash
npm install pdfkit
```
Creates professional PDF documents with text, images, shapes, and gradients.

**Verify**:
```bash
npm list pdfkit
# Should show: pdfkit@X.X.X
```

#### Twilio (for SMS/WhatsApp)
```bash
npm install twilio
```
Provides SMS and WhatsApp messaging APIs.

**Verify**:
```bash
npm list twilio
# Should show: twilio@X.X.X
```

### 2. Create Environment Configuration

**Gmail Setup (for Email)**:

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Generate 16-character app password
4. Copy and paste into `.env`:
```dotenv
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Twilio Setup (for SMS/WhatsApp)**:

1. Create account: https://www.twilio.com/
2. Go to Console → Account → API Keys
3. Copy Account SID and Auth Token
4. Get trial phone number for SMS
5. Add to `.env`:
```dotenv
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=yyyyyyyyyyyyyyyyyyyyy
TWILIO_PHONE_FROM=+1234567890
TWILIO_WHATSAPP_FROM=+1234567890
```

### 3. Database Schema

The Phase 5 migration creates 8 new tables:

```
1. notification_preferences    ← Customer settings
2. notifications              ← Audit trail
3. newsletter_subscribers     ← Newsletter management
4. sms_logs                   ← SMS delivery tracking
5. email_logs                 ← Email delivery tracking
6. notification_templates     ← Email/SMS templates
7. +3 views                   ← Analytics views
```

**Verify Migration Success**:
```bash
psql -U postgres -d myapp -c "\dt notification_" | head -20
```

Should show:
```
                       List of relations
 Schema |                Name                 | Type  | Owner
--------+-------------------------------------+-------+----------
 public | email_logs                          | table | postgres
 public | newsletter_subscribers              | table | postgres
 public | notification_logs                   | table | postgres
 public | notification_preferences            | table | postgres
 public | sms_logs                            | table | postgres
```

### 4. Create Migration Script (Optional)

For easier future migrations, create `server/scripts/run-phase5-migration.js`:

```javascript
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function runMigration() {
  try {
    console.log('Running Phase 5 migration...');
    
    const sqlFile = path.join(__dirname, '../../Database/migrations/V10__notifications.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      await pool.query(statement);
      console.log('✓ Statement executed');
    }
    
    console.log('✓ All Phase 5 tables created successfully');
    
    // Check if tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'notification%'
    `);
    
    console.log(`✓ Created ${result.rows.length} tables`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
```

Run with:
```bash
node server/scripts/run-phase5-migration.js
```

### 5. Verify Services Are Loading

Start the backend and check logs:

```bash
npm start
```

Expected output:
```
✓ Server running on port 4000
✓ Connected to PostgreSQL
```

### 6. Test Notification Routes

```bash
# Test preferences endpoint
curl -X GET http://localhost:4000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return customer preferences (or create defaults)
```

---

## Configuration Details

### Email Configuration

**Gmail SMTP Settings**:
```
Host: smtp.gmail.com
Port: 587
Secure: false (use STARTTLS)
Auth:
  user: your-email@gmail.com
  pass: xxxx xxxx xxxx xxxx (app password)
```

**Troubleshooting Gmail**:
- ❌ "Invalid credentials" → Check app password format
- ❌ "Less secure apps" error → Enable at myaccount.google.com/lesssecureapps
- ❌ "Too many attempts" → Wait 24 hours before retrying

### SMS Configuration

**Twilio Settings**:
- Account SID: Identifies your account
- Auth Token: Required for API authentication
- Phone Number: Trial number for testing (prefix +1)
- WhatsApp From: Can be same as SMS number

**Phone Number Format**:
- All numbers must be E.164 format
- Examples: +14155238886 (US), +919876543210 (India)
- Single leading +, no spaces/dashes

**Twilio Pricing**:
- Trial account: $15 free credit
- SMS: ~$0.01 per message (varies by country)
- WhatsApp: ~$0.005 per message (varies)

---

## File Manifest

### New Service Files
- `src/utils/emailServiceEnhanced.js` (600 lines) - Email service with templates
- `src/utils/smsServiceTwilio.js` (450 lines) - SMS & WhatsApp service
- `src/utils/pdfService.js` (350 lines) - PDF invoice generation
- `src/utils/notificationPreferences.js` (400 lines) - Preference management

### New Route Files
- `src/routes/notifications.js` (400 lines) - Notification API endpoints

### New Database Migration
- `Database/migrations/V10__notifications.sql` (300 lines) - Tables & views

### Documentation Files
- `documentation/PHASE5_NOTIFICATIONS.md` - Comprehensive guide
- `documentation/PHASE5_API_REFERENCE.md` - API endpoints
- `documentation/PHASE5_SETUP.md` - This file

### Updated Files
- `src/index.js` - Added notification routes

---

## Verification Checklist

After setup, verify everything is working:

- [ ] `npm install pdfkit twilio` succeeded
- [ ] `.env` has EMAIL and TWILIO variables
- [ ] Database migration ran without errors
- [ ] Backend server starts on port 4000
- [ ] `/api/notifications/preferences` endpoint accessible
- [ ] Test email sends successfully
- [ ] Permission to access `/uploads` folder
- [ ] All 8 notification tables created in database

---

## Testing Phase 5

### Manual API Testing

**1. Test Email Service**:
```bash
curl -X POST http://localhost:4000/api/notifications/send-test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "email"}'
```

Expected: Test email arrives in inbox

**2. Test SMS Service** (if Twilio configured):
```bash
curl -X POST http://localhost:4000/api/notifications/send-test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"type": "sms"}'
```

Expected: Test SMS arrives on phone

**3. Test Invoice Generation**:
```bash
curl -X GET "http://localhost:4000/api/notifications/invoice/5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: JSON invoice data returned

**4. Test Invoice PDF Download**:
```bash
curl -X GET "http://localhost:4000/api/notifications/invoice/5?format=pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o invoice-5.pdf
```

Expected: PDF file saved locally

---

## Environment Variables Reference

### Required for Email
```dotenv
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
EMAIL_FROM=Sai Scientifics <your-email@gmail.com>
```

### Required for SMS/WhatsApp
```dotenv
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=token_here
TWILIO_PHONE_FROM=+1234567890
TWILIO_WHATSAPP_FROM=+1234567890
```

### Required for Frontend Links
```dotenv
FRONTEND_URL=http://localhost:5173
```

### Optional
```dotenv
# Notification templates location
NOTIFICATION_TEMPLATES_DIR=./templates

# PDF storage location
PDF_STORAGE_DIR=./uploads

# Email retry settings
EMAIL_MAX_RETRIES=3
EMAIL_RETRY_DELAY=5000

# SMS rate limiting
SMS_RATE_LIMIT=10
SMS_RATE_LIMIT_WINDOW=60000
```

---

## Package Versions

Recommended versions for Phase 5:

```json
{
  "dependencies": {
    "pdfkit": "^0.14.0",
    "twilio": "^3.85.0"
  }
}
```

Check current versions:
```bash
npm list pdfkit twilio
```

---

## Common Issues & Solutions

### Issue: "Cannot find module 'pdfkit'"
**Solution**: `npm install pdfkit`

### Issue: Twilio "Invalid credentials"
**Solution**: 
1. Verify Account SID and Auth Token match
2. Check they have no extra whitespace
3. Regenerate tokens in Twilio dashboard

### Issue: Gmail "Less secure apps" blocked
**Solution**:
1. If 2FA enabled: Use app-specific password
2. If 2FA disabled: Enable "Less secure apps"
3. Or use Gmail with OAuth2 (advanced)

### Issue: Phone number invalid for SMS
**Solution**: 
- Must be E.164 format: +{country}{number}
- India example: +919876543210
- US example: +14155238886

### Issue: Database migration fails
**Solution**:
1. Verify PostgreSQL is running
2. Check DATABASE_URL is correct
3. Ensure you're in server/ directory
4. Check migration file path is correct

### Issue: PDF generation fails
**Solution**:
1. Verify /uploads directory exists: `mkdir -p server/uploads`
2. Check write permissions: `chmod 755 server/uploads`
3. Ensure disk space available: `df -h`
4. Verify PDFKit installed: `npm list pdfkit`

---

## Performance Tuning

### Email Sending
- Batch send limit: 100 emails per minute
- Retry on failure: Up to 3 times
- Batch size: 10-50 per task

### SMS Sending  
- Rate limit: 10 SMS/second (Twilio limit)
- Batch send: Process queue in batches of 5
- Delay between: 100ms to avoid rate limiting

### PDF Generation
- Cache generated PDFs for 7 days
- Compress PDFs to reduce file size
- Clean up old PDFs monthly

---

## Next Steps

1. **Complete Setup** (15 minutes)
   - Install packages
   - Configure .env
   - Run migration
   - Test endpoints

2. **Test Notifications** (30 minutes)
   - Send test email
   - Send test SMS (if enabled)
   - Generate test invoice
   - Verify in database

3. **Integrate with Phase 4** (30 minutes)
   - Call email service after payment
   - Send SMS confirmations
   - Generate invoices automatically
   - Update order status

4. **Move to Phase 6** (Next)
   - Load testing
   - Performance optimization
   - Advanced segmentation

---

**Setup Complete!** Phase 5 is ready to integrate.

Next: Run tests and verify all notification channels working → Then proceed to Phase 6

