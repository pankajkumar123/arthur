# Phase 5: Email & Notifications Extensions

**Status**: Complete Implementation  
**Date**: February 16, 2026  
**Scope**: Advanced notification system with email, SMS, WhatsApp, and PDF invoices

---

## Overview

Phase 5 extends Phase 4 (Payment Integration) with a comprehensive notification system that manages customer communications across multiple channels:

- **Email**: Professional HTML email templates with tracking
- **SMS**: Text message notifications via Twilio
- **WhatsApp**: Rich messaging with templates
- **PDF Invoices**: Professional invoice generation and distribution
- **Notification Preferences**: Customer control over notification channels/frequency

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Phase 5: Notifications                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Notification Channels                            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  📧 Email      → emailServiceEnhanced.js        │  │
│  │  💬 SMS        → smsServiceTwilio.js            │  │
│  │  📱 WhatsApp   → smsServiceTwilio.js            │  │
│  │  📄 PDF Invoice → pdfService.js                 │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Preference Management                            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  • Per-channel toggles                           │  │
│  │  • Per-notification-type settings                │  │
│  │  • Do Not Disturb (time-based)                   │  │
│  │  • Frequency control (daily/weekly/monthly)      │  │
│  │  • Newsletter management                         │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Delivery & Tracking                              │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  • Delivery status logging                       │  │
│  │  • Email open/click tracking                     │  │
│  │  • SMS delivery confirmation                     │  │
│  │  • Error handling & retries                      │  │
│  │  • Audit trail in database                       │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ API Routes (/api/notifications/*)               │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  GET  /preferences        → Get settings         │  │
│  │  PUT  /preferences        → Update settings      │  │
│  │  POST /send-test          → Test notification   │  │
│  │  GET  /invoice/:orderId   → Download invoice    │  │
│  │  POST /send-invoice/:id   → Email invoice       │  │
│  │  GET  /history            → View notification log│  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## New Files & Services

### 1. Enhanced Email Service
**File**: `server/src/utils/emailServiceEnhanced.js` (600+ lines)
**Functions**:
- `sendOrderConfirmation()` - Order confirmation with invoice details
- `sendShipmentNotification()` - Tracking information and next steps
- `sendDeliveryNotification()` - Delivery confirmation and review link
- `sendGrievanceResponse()` - Support ticket response
- `sendPromotion()` - Marketing campaigns with discount codes
- `testConnection()` - Verify email service is working

**Email Templates**:
- Professional HTML with company branding
- Responsive design for mobile/desktop
- Action buttons (View Order, Track Package, etc.)
- Color-coded status badges (✓ Paid, 📦 Dispatched, etc.)

### 2. SMS & WhatsApp Service
**File**: `server/src/utils/smsServiceTwilio.js` (450+ lines)
**Setup**: Twilio account required
**Functions**:
- `sendSMS()` - Generic SMS sending
- `sendWhatsApp()` - WhatsApp messaging with media
- `sendOrderConfirmationSMS()` - Order confirmation SMS
- `sendShipmentTrackingSMS()` - Tracking number via SMS
- `sendWhatsAppOrderUpdate()` - Rich WhatsApp message
- `sendOTPSMS()` - One-time password for security
- `checkMessageStatus()` - Check delivery status
- `sendBulkSMS()` - Mass messaging with rate limiting

**Features**:
- Rate limiting to prevent API abuse
- Automatic retry logic
- Message status tracking
- Optional media support (WhatsApp)

### 3. PDF Invoice Service
**File**: `server/src/utils/pdfService.js` (350+ lines)
**Setup**: `npm install pdfkit`
**Functions**:
- `generateInvoicePDF()` - Create professional PDF invoice
- `generateInvoiceStream()` - Stream PDF for download
- `generateBatchInvoices()` - Create multiple invoices
- `getInvoicePath()` - Get invoice file location
- `invoiceExists()` - Check if invoice exists
- `deleteInvoice()` - Remove invoice file

**Invoice Components**:
- Header with company logo/details
- Customer billing information
- Itemized product list with quantities/pricing
- GST calculation (18%)
- Summary with subtotal/tax/shipping
- Payment method and status
- Terms & conditions
- Professional footer

### 4. Notification Preferences Service
**File**: `server/src/utils/notificationPreferences.js` (400+ lines)
**Database**: `notification_preferences` table
**Functions**:
- `getPreferences()` - Retrieve customer settings
- `updatePreferences()` - Modify notification channels
- `setAllNotifications()` - Enable/disable all at once
- `shouldNotify()` - Check if notification should send
- `getNotificationSummary()` - Dashboard summary

**Preferences Include**:
- Email: Order updates, shipment, promotional, newsletter
- SMS: Confirmations, tracking, OTP, promotions
- WhatsApp: Order updates, support, promotional
- Push: Optional push notification settings
- Do Not Disturb: Time-based quiet hours
- Frequency Control: Daily/Weekly/Monthly for promotions

### 5. Notification Routes
**File**: `server/src/routes/notifications.js` (400+ lines)
**Endpoints**:
```
GET  /api/notifications/preferences         ← Get settings
PUT  /api/notifications/preferences         ← Update settings
PUT  /api/notifications/preferences/all     ← Toggle all
GET  /api/notifications/summary             ← Dashboard view
POST /api/notifications/send-test           ← Test notification
POST /api/notifications/subscribe           ← Newsletter signup
POST /api/notifications/unsubscribe         ← Newsletter unsub
GET  /api/notifications/invoice/:orderId    ← Get invoice
POST /api/notifications/send-invoice/:id    ← Email invoice
GET  /api/notifications/history             ← Notification log
```

---

## Database Tables

### notification_preferences
Stores customer's channel preferences and frequency settings
```sql
customer_id      | Email/SMS/WhatsApp toggles
notification     | Per-notification type settings
do_not_disturb   | Quiet hours (22:00-06:00)
promotional_freq | daily/weekly/monthly
```

### notifications
Audit trail of all notifications sent
```sql
customer_id         | Who received it
channel            | email/sms/whatsapp/push
notification_type  | order/shipment/promo/etc
delivery_status    | pending/sent/delivered/failed
external_message_id | Provider's tracking ID
```

### newsletter_subscribers
Newsletter subscription management
```sql
email              | Subscriber email
subscription_status| active/inactive/unsubscribed
frequency          | daily/weekly/monthly
engagement_metrics | opens/clicks/bounces
```

### sms_logs & email_logs
Provider-level audit trails with cost tracking and engagement metrics

---

## API Endpoint Examples

### 1. Get Notification Preferences

**Request**:
```bash
curl -X GET http://localhost:4000/api/notifications/preferences \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "preferences": {
    "customer_id": 5,
    "email_enabled": true,
    "email_order_confirmation": true,
    "email_promotional": false,
    "sms_enabled": true,
    "whatsapp_enabled": false,
    "do_not_disturb_enabled": true,
    "do_not_disturb_start_time": "22:00:00",
    "do_not_disturb_end_time": "06:00:00",
    "promotional_frequency": "weekly"
  }
}
```

### 2. Update Preferences

**Request**:
```bash
curl -X PUT http://localhost:4000/api/notifications/preferences \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_promotional": true,
    "sms_enabled": true,
    "promotional_frequency": "daily"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": { ... updated preferences ... }
}
```

### 3. Send Test Notification

**Request**:
```bash
curl -X POST http://localhost:4000/api/notifications/send-test \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "email"}'
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "result": {
    "success": true,
    "messageId": "msg_12345"
  }
}
```

### 4. Get Invoice

**Request**:
```bash
curl -X GET "http://localhost:4000/api/notifications/invoice/5" \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Response** (200 OK) - JSON format:
```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "INV-1708119885-5",
    "orderId": 5,
    "orderNumber": "ORD-1708119885-5",
    "customerName": "John Doe",
    "totalAmount": 2948.60,
    "items": [
      {
        "productName": "Industrial Equipment",
        "quantity": 2,
        "unitPrice": 1200.00,
        "lineTotal": 2400.00
      }
    ],
    "paymentStatus": "success",
    "orderStatus": "confirmed"
  }
}
```

**For PDF**:
```bash
curl -X GET "http://localhost:4000/api/notifications/invoice/5?format=pdf" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -o invoice-5.pdf
```

### 5. Email Invoice

**Request**:
```bash
curl -X POST http://localhost:4000/api/notifications/send-invoice/5 \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Invoice sent to your email"
}
```

---

## Required Environment Variables

Add to `.env` file:

```dotenv
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sales@saiscientifics.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=Sai Scientifics <sales@saiscientifics.com>

# SMS & WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=AC1234567890abcdef
TWILIO_AUTH_TOKEN=auth_token_here
TWILIO_PHONE_FROM=+14155238886
TWILIO_WHATSAPP_FROM=+14155238886

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

---

## Dependencies

Add to `package.json`:

```bash
npm install pdfkit
npm install twilio
```

---

## Setup Instructions

### Step 1: Install Dependencies
```bash
cd server
npm install pdfkit twilio
```

### Step 2: Configure Environment Variables
```bash
# Edit .env file with Twilio and email credentials
```

### Step 3: Run Database Migration
```bash
node -e "
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const sql = fs.readFileSync('../Database/migrations/V10__notifications.sql', 'utf8');
  await pool.query(sql);
  console.log('✓ Phase 5 tables created');
  await pool.end();
}

migrate().catch(console.error);
"
```

### Step 4: Initialize Notification Preferences
```javascript
// Auto-created when customer first accesses preferences
// Or create manually via:
const notificationPreferences = require('./src/utils/notificationPreferences');
await notificationPreferences.createNotificationPreferencesTable();
```

---

## Email Templates

### Order Confirmation Email
- ✓ Status badge (green, paid)
- Order number, date, time
- Order items with quantities
- Subtotal + GST (18%) calculation
- "What happens next?" timeline
- Action buttons: View Order, Contact Support

### Shipment Notification Email
- 📦 Status badge (blue, dispatched)
- Courier name
- Tracking number (clickable link)
- Estimated delivery date
- Timeline animation (dispatched → transit → delivery)
- Warning: provide clear address

### Delivery Confirmation Email
- ✓ Status badge (green, delivered)
- Order number and value
- Delivery date
- Review link button
- Help center link

### Grievance Response Email
- Ticket ID and subject
- Detailed response text
- Status color-coded
- View grievances link

### Promotional Email
- Large discount % badge
- Coupon code (bold, monospace)
- Expiry date
- Shop now button
- Terms disclaimer

---

## SMS Templates

### Order Confirmation SMS
```
Hi! Your order ORD-1708 of ₹2,948 is confirmed. Expected delivery: Feb 20. View status: link
```

### Shipment Tracking SMS
```
Good news! Your order ORD-1708 is dispatched. Track with Fedex: RFX123456
```

### Delivery Confirmation SMS
```
Your order ORD-1708 has been delivered! Please review and let us know your experience.
```

### OTP SMS
```
Your Sai Scientifics OTP is: 123456. Valid for 5 minutes. Do not share.
```

### Payment Reminder SMS
```
Reminder: Your order ORD-1708 is pending payment of ₹2,948. Complete: link
```

---

## WhatsApp Templates

### Order Update
```
Thank you! Your order *ORD-1708* is confirmed. 
We'll keep you updated on the status.
```

### Shipment Update
```
Good news! Your order *ORD-1708* is on the way. 
You'll receive tracking details shortly.
```

### Promotion
```
🎉 *Exclusive Offer* 🎉

Get *20% OFF* on Electronics

Code: *SAVE20*
Valid till: Feb 28

[Shop Now](link)
```

---

## Do Not Disturb Feature

Customers can set quiet hours:
- **Start Time**: 22:00 (10 PM)
- **End Time**: 06:00 (6 AM)
- **Timezone**: Asia/Kolkata (configurable)

Promotional/non-urgent notifications won't send during DND hours.
Emergency notifications (OTP, payment alerts) still send.

---

## Notification Preferences Example

```javascript
// Typical customer preferences
{
  email_enabled: true,
  email_order_confirmation: true,
  email_shipment_updates: true,
  email_promotional: false,        // Don't send promos
  
  sms_enabled: true,
  sms_order_confirmation: true,
  sms_promotional: false,
  
  whatsapp_enabled: false,         // Not using WhatsApp
  
  do_not_disturb_enabled: true,
  do_not_disturb_start_time: "22:00",
  do_not_disturb_end_time: "06:00",
  
  promotional_frequency: "weekly"  // Only once per week
}
```

---

## Analytics & Reporting

### Email Engagement View
```sql
SELECT 
  DATE(created_at) as email_date,
  COUNT(*) as total_emails,
  SUM(CASE WHEN opened THEN 1 ELSE 0 END) as opened,
  ROUND(100.0 * SUM(CASE WHEN opened THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
FROM email_logs
GROUP BY DATE(created_at);
```

### Notification Statistics View
```sql
SELECT 
  DATE(created_at) as date,
  channel,
  COUNT(*) as total,
  SUM(CASE WHEN delivery_status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN delivery_status = 'failed' THEN 1 ELSE 0 END) as failed
FROM notifications
GROUP BY DATE(created_at), channel;
```

---

## Error Handling

### Email Failures
- Log error message
- Retry up to 3 times
- Escalate if persistent
- Check email_logs table

### SMS Failures
- Twilio returns error code
- Log to sms_logs table
- User receives error message
- Check Twilio dashboard

### WhatsApp Failures
- Similar to SMS (uses Twilio)
- Common issues: invalid phone, delivery to non-WhatsApp number

### PDF Generation Failures
- File system errors
- Missing templates
- Fallback to JSON invoice

---

## Testing

### Test Email
```bash
curl -X POST http://localhost:4000/api/notifications/send-test \
  -H "Authorization: Bearer TOKEN" \
  -d '{"type": "email"}'
```

### Test SMS (requires Twilio config)
```bash
curl -X POST http://localhost:4000/api/notifications/send-test \
  -H "Authorization: Bearer TOKEN" \
  -d '{"type": "sms"}'
```

### Test Invoice Generation
```bash
curl -X GET "http://localhost:4000/api/notifications/invoice/5?format=pdf" \
  -H "Authorization: Bearer TOKEN" \
  -o test-invoice.pdf
```

---

## Next Steps: Phase 6

After Phase 5 (Email & Notifications) is complete, Phase 6 will include:
- **Performance Testing**: Load test notifications at scale
- **A/B Testing**: Email subject lines, sending times
- **Segmentation**: Target specific customer groups
- **Automation**: Triggered workflows based on customer actions
- **Mobile Push**: Native app push notifications

---

## Troubleshooting

### Email Not Sending
1. Check .env: EMAIL_USER, EMAIL_PASSWORD
2. Enable "Less secure app access" on Gmail
3. Generate app-specific password (2FA enabled)
4. Check error.log

### SMS Not Sending
1. Verify .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
2. Check phone number format (+919876543210)
3. Verify Twilio account has credits
4. Check error response in logs

### Invoice PDF Not Generating
1. Ensure /uploads directory exists
2. Check file permissions
3. Verify PDFKit installed: `npm list pdfkit`
4. Check disk space

### Preferences Not Updating
1. Verify customer_id is correct
2. Check notification_preferences table exists
3. Verify auth token valid
4. Review database error logs

---

**Phase 5 Status**: ✅ Complete  
**Total Files Created**: 5 services + 1 routes + 1 migration  
**Total Lines of Code**: 2,000+  
**Database Tables**: 8 new tables  
**API Endpoints**: 10 new endpoints

Ready for Phase 6: Testing & Optimization

