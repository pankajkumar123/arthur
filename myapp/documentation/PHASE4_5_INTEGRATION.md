# Phase 4+5 Integration Guide
## Auto-Trigger Notifications on Payment Success

This guide explains how Phase 4 (Payment Integration) and Phase 5 (Notifications) are integrated to automatically send emails, SMS, and generate invoices when payments are successfully verified.

---

## Overview

When a customer completes payment via Razorpay and the payment signature is verified, the system now automatically:

1. ✅ **Sends Professional Email** - Order confirmation with full details, itemized list, delivery address
2. ✅ **Sends SMS Notification** - Short confirmation message with order number and estimated delivery
3. ✅ **Generates PDF Invoice** - Professional invoice with company branding, GST calculation, payment details
4. ✅ **Emails Invoice Attachment** - Sends the PDF invoice as email attachment
5. ✅ **Logs All Notifications** - Tracks all sent notifications in database for audit trail

---

## Integration Flow

```
Customer Payment → Razorpay → Payment Verification → Multi-Channel Notifications
```

### Step-by-Step Process

1. **Customer Initiates Payment**
   - Frontend calls `POST /api/payment/create-order` with orderId
   - Backend creates Razorpay order and returns payment details
   - Customer completes payment on Razorpay checkout page

2. **Payment Verification**
   - Frontend calls `POST /api/payment/verify` with payment details
   - Backend verifies HMAC-SHA256 signature
   - If valid, triggers notification cascade

3. **Automatic Notifications** (New in Phase 4+5 Integration)
   - **Email**: Sends HTML email with order summary, items table, timeline
   - **SMS**: Sends 160-char SMS with order number and delivery estimate
   - **PDF**: Generates invoice PDF and saves to `/uploads/invoice-{orderId}.pdf`
   - **Invoice Email**: Sends separate email with PDF attachment
   - **Database Log**: Records all notifications in `notifications` table

---

## Code Changes

### 1. Payment Verification Route (payment.js)

**File**: `server/src/routes/payment.js`

**Changes Made**:

#### Import New Services
```javascript
const emailServiceEnhanced = require('../utils/emailServiceEnhanced');
const smsService = require('../utils/smsServiceTwilio');
const pdfService = require('../utils/pdfService');
const notificationPreferences = require('../utils/notificationPreferences');
```

#### Enhanced Order Query
Now fetches complete order details including customer info and order items:
```javascript
const orderResult = await db.query(
  `SELECT o.id, o.customer_id, o.order_number, o.total_amount, o.subtotal, o.gst_amount, 
          o.shipping_cost, o.delivery_address, o.city, o.state, o.pincode, o.payment_method,
          c.full_name, c.email, c.phone
   FROM orders o
   JOIN customer_user c ON c.id = o.customer_id
   WHERE o.id = $1 AND o.customer_id = $2`,
  [orderId, req.user.id]
);
```

#### Order Items Query
Fetches product details for email display:
```javascript
const itemsResult = await db.query(
  `SELECT oi.quantity, oi.unit_price, p.name as product_name, p.sku
   FROM order_items oi
   JOIN product p ON p.id = oi.product_id
   WHERE oi.order_id = $1`,
  [orderId]
);
```

#### Notification Preference Check
Respects customer notification preferences and Do Not Disturb settings:
```javascript
const preferences = await notificationPreferences.getPreferences(req.user.id);

if (await notificationPreferences.shouldNotify(req.user.id, 'order_confirmation', 'email')) {
  // Send email
}
```

#### Enhanced Email Notification
Sends professional HTML email with complete order details:
```javascript
await emailServiceEnhanced.sendOrderConfirmation(
  order.email,
  {
    orderNumber: order.order_number,
    orderId: orderId,
    totalAmount: parseFloat(order.total_amount),
    subtotal: parseFloat(order.subtotal),
    gst: parseFloat(order.gst_amount),
    shipping: parseFloat(order.shipping_cost),
    items: items,
    customerName: order.full_name,
    transactionId: razorpayPaymentId,
    paymentMethod: order.payment_method,
    deliveryAddress: {
      line: order.delivery_address,
      city: order.city,
      state: order.state,
      pincode: order.pincode
    }
  }
);
```

#### SMS Notification
Sends concise SMS if phone number available:
```javascript
if (order.phone && await notificationPreferences.shouldNotify(req.user.id, 'order_confirmation', 'sms')) {
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days estimate
  
  await smsService.sendOrderConfirmationSMS(
    order.phone,
    {
      orderNumber: order.order_number,
      totalAmount: parseFloat(order.total_amount).toFixed(2),
      estimatedDelivery: estimatedDelivery.toLocaleDateString('en-IN')
    }
  );
}
```

#### PDF Invoice Generation
Creates and saves professional invoice:
```javascript
const invoiceData = {
  orderId: orderId,
  orderNumber: order.order_number,
  orderDate: new Date(),
  customer: {
    name: order.full_name,
    email: order.email,
    phone: order.phone,
    address: {
      line: order.delivery_address,
      city: order.city,
      state: order.state,
      pincode: order.pincode
    }
  },
  items: items,
  subtotal: parseFloat(order.subtotal),
  gst: parseFloat(order.gst_amount),
  shipping: parseFloat(order.shipping_cost),
  total: parseFloat(order.total_amount),
  payment: {
    method: order.payment_method,
    transactionId: razorpayPaymentId,
    status: 'paid'
  }
};

await pdfService.generateInvoicePDF(invoiceData);
```

#### Invoice Email
Sends invoice as PDF attachment:
```javascript
const invoicePath = pdfService.getInvoicePath(orderId);
await emailServiceEnhanced.sendInvoiceEmail(
  order.email,
  {
    customerName: order.full_name,
    orderNumber: order.order_number,
    totalAmount: parseFloat(order.total_amount),
    invoicePath: invoicePath
  }
);
```

#### Notification Audit Log
Records notification in database:
```javascript
await db.query(
  `INSERT INTO notifications (customer_id, type, channel, status, metadata)
   VALUES ($1, $2, $3, $4, $5)`,
  [
    req.user.id,
    'order_confirmation',
    'email',
    'sent',
    JSON.stringify({ orderId, orderNumber: order.order_number })
  ]
);
```

---

## Database Changes

### 1. Fixed Schema Mismatches (V11__fix_tables.sql)

**Problem**: Application code expected `orders` table but migrations created `customer_order`. Also, data types (INTEGER vs UUID) were inconsistent.

**Solution**: Created new migration to align database with application code.

**Tables Created**:
- `orders` - Main orders table with UUID primary key
- `order_items` - Order line items
- `cart` - Shopping cart with customer_id directly

All foreign keys now use UUID to match `customer_user.id` type.

### 2. Fixed payment_logs Table (V9__payment_logs.sql)

**Changes**:
- `order_id`: Changed from INTEGER to UUID
- `customer_id`: Changed from INTEGER to UUID  
- `amount`: Changed from `amount_paise INTEGER` to `amount NUMERIC(12, 2)` (stores amount in rupees, not paise)

### 3. Notification Tables (V10__notifications.sql)

**Fixed customer_id references**:
All tables now use `customer_id UUID` instead of `customer_id INTEGER`:
- `notification_preferences`
- `notifications`
- `newsletter_subscribers`
- `sms_logs`
- `email_logs`

---

## Email Service Enhancement

### New Function: sendInvoiceEmail()

**File**: `server/src/utils/emailServiceEnhanced.js`

**Purpose**: Sends invoice PDF as email attachment

**Parameters**:
```javascript
{
  customerName: 'John Doe',
  orderNumber: 'ORD-12345678-98765',
  totalAmount: 5000.00,
  invoicePath: '/uploads/invoice-{orderId}.pdf'
}
```

**Email Content**:
- Professional HTML template with gradient header
- Invoice status badge (PAID)
- Order details box
- PDF attachment with filename `invoice-{orderNumber}.pdf`

**Added to exports**:
```javascript
module.exports = {
  sendOrderConfirmation,
  sendShipmentNotification,
  sendDeliveryNotification,
  sendGrievanceResponse,
  sendPromotion,
  sendInvoiceEmail,  // ← NEW
  testConnection,
  transporter
};
```

---

## Configuration Required

### 1. Email Configuration (.env)

Already configured in Phase 4, no changes needed:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Sai Scientifics <sales@saiscientifics.com>"
```

### 2. SMS Configuration (.env)

**Optional** - If you want SMS notifications:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_FROM=+1234567890
TWILIO_WHATSAPP_FROM=+1234567890
```

**Note**: System gracefully degrades if Twilio not configured. SMS notifications will be skipped without causing errors.

### 3. Frontend URL (.env)

Used in email links:
```env
FRONTEND_URL=http://localhost:5173
```

---

## Testing the Integration

### Prerequisites

1. **Database Migrations**
   ```bash
   # Run all migrations in order
   psql -U postgres -d myapp -f Database/migrations/V8__customer_auth.sql
   psql -U postgres -d myapp -f Database/migrations/V9__payment_logs.sql
   psql -U postgres -d myapp -f Database/migrations/V10__notifications.sql
   psql -U postgres -d myapp -f Database/migrations/V11__fix_tables.sql
   ```

2. **Install Dependencies**
   ```bash
   cd server
   npm install nodemailer pdfkit twilio
   ```

3. **Configure Environment**
   - Verify EMAIL_* variables in `.env`
   - Optionally add TWILIO_* variables for SMS
   - Set FRONTEND_URL

### Test Procedure

#### 1. Start Backend Server
```bash
cd server
npm start
```

#### 2. Complete a Test Order

**A. Create User & Login**
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "password": "Test@1234"
  }'

# Login (save the token)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

**B. Add Items to Cart**
```bash
curl -X POST http://localhost:4000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_UUID",
    "quantity": 2
  }'
```

**C. Create Order**
```bash
curl -X POST http://localhost:4000/api/orders/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressLine": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "paymentMethod": "razorpay"
  }'
```

**D. Create Payment Order**
```bash
curl -X POST http://localhost:4000/api/payment/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_UUID_FROM_PREVIOUS_STEP"
  }'
```

**E. Simulate Payment Verification**

For testing, you can manually call verify endpoint with test signature:
```bash
# In production, this would be called by Razorpay after payment
curl -X POST http://localhost:4000/api/payment/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayPaymentId": "pay_test123",
    "razorpayOrderId": "order_test123",
    "razorpaySignature": "VALID_SIGNATURE",
    "orderId": "YOUR_ORDER_UUID"
  }'
```

#### 3. Verify Notifications Sent

**Check Email**:
- Look for "Order Confirmed" email in test@example.com inbox
- Should have professional HTML design with order details
- Check for second email with PDF invoice attachment

**Check SMS** (if Twilio configured):
- Look for SMS on +919876543210 phone number
- Should say: "Hi! Your order ORD-xxx of ₹xxx is confirmed..."

**Check PDF Invoice**:
- Look in `server/uploads/` folder
- Should see `invoice-{orderId}.pdf`
- Open PDF to verify professional layout

**Check Database Logs**:
```sql
-- Check notifications table
SELECT * FROM notifications WHERE customer_id = 'YOUR_USER_UUID' ORDER BY created_at DESC;

-- Check payment logs
SELECT * FROM payment_logs WHERE order_id = 'YOUR_ORDER_UUID';

-- Check email logs (if configured)
SELECT * FROM email_logs WHERE customer_id = 'YOUR_USER_UUID';
```

---

## Error Handling

### Graceful Degradation

The integration is designed to continue even if individual notifications fail:

1. **Email Fails**: Error logged, SMS still attempted, invoice still generated
2. **SMS Fails**: Error logged (or skipped if Twilio not configured), other notifications continue
3. **PDF Generation Fails**: Error logged, payment still confirmed, order still valid
4. **Invoice Email Fails**: Error logged, but order confirmation email already sent

### Error Logs

All errors are logged with context:
```javascript
logger.error('Enhanced email sending failed', { orderId, error: emailError.message });
logger.error('SMS sending failed', { orderId, error: smsError.message });
logger.error('PDF invoice generation failed', { orderId, error: pdfError.message });
```

Check logs in `server/logs/` directory.

---

## Notification Preferences

### Default Behavior

On first order, default preferences are created:
- **Email**: ALL enabled (order, shipment, delivery notifications)
- **SMS**: Disabled by default (except OTP)
- **WhatsApp**: Disabled by default
- **Do Not Disturb**: Disabled

### Checking Preferences Before Sending

The integration respects customer preferences:
```javascript
// Email only sent if customer has email_order_confirmation enabled
if (await notificationPreferences.shouldNotify(req.user.id, 'order_confirmation', 'email')) {
  await emailServiceEnhanced.sendOrderConfirmation(...);
}

// SMS only sent if customer has sms_order_confirmation enabled
if (await notificationPreferences.shouldNotify(req.user.id, 'order_confirmation', 'sms')) {
  await smsService.sendOrderConfirmationSMS(...);
}
```

### Do Not Disturb

If customer enables Do Not Disturb (e.g., 10 PM - 8 AM), notifications scheduled during that window are:
- **Promotional**: Skipped entirely
- **Transactional** (order confirmations): Sent immediately (critical business notifications)

---

## Performance Considerations

### Asynchronous Operations

All notifications are sent asynchronously with try-catch blocks to prevent blocking the payment confirmation response.

### Database Transactions

Payment verification and order status update happen in a transaction, ensuring data consistency even if notifications fail.

### Invoice Caching

Once generated, PDF invoices are stored on disk at `/uploads/invoice-{orderId}.pdf`. Subsequent requests serve the cached file instead of regenerating.

---

## Future Enhancements

### Planned for Phase 6

1. **WhatsApp Integration**: Auto-send WhatsApp messages for shipment tracking
2. **Push Notifications**: Browser push notifications for order updates
3. **Email Open Tracking**: Track when customers open emails
4. **Retry Logic**: Auto-retry failed notifications with exponential backoff
5. **Batch Processing**: Queue notifications for high-volume periods

---

## Troubleshooting

### Email Not Sending

**Check**:
1. EMAIL_* variables in `.env` are correct
2. Gmail app password is valid (not your regular password)
3. Less secure app access enabled in Gmail settings
4. Check `server/logs/` for error messages

**Test email connection**:
```javascript
const emailService = require('./utils/emailServiceEnhanced');
await emailService.testConnection();
```

### SMS Not Sending

**Remember**: SMS is optional. If Twilio not configured, SMS is skipped without error.

**If you want SMS**:
1. Create Twilio account at https://www.twilio.com/
2. Verify your phone number
3. Add credentials to `.env`
4. Check Twilio console for delivery status

### PDF Not Generating

**Check**:
1. `server/uploads/` directory exists and is writable
2. PDFKit installed: `npm list pdfkit`
3. Check logs for specific error message

**Manual test**:
```javascript
const pdfService = require('./utils/pdfService');
await pdfService.generateInvoicePDF({
  orderId: 'test-uuid',
  orderNumber: 'ORD-TEST-123',
  // ... other fields
});
```

### Database Errors

**"Table orders does not exist"**:
Run V11 migration: `psql -U postgres -d myapp -f Database/migrations/V11__fix_tables.sql`

**"Column type mismatch"**:
Ensure V9 and V10 migrations updated with UUID types (not INTEGER)

### Notification Preferences Not Working

**Check**:
1. `notification_preferences` table exists (V10 migration)
2. Default preferences created on first order
3. `shouldNotify()` function checking correct preference columns

---

## API Documentation

### Updated Endpoint: POST /api/payment/verify

**Now includes automatic notifications**

**Request**:
```json
{
  "razorpayPaymentId": "pay_abc123",
  "razorpayOrderId": "order_xyz789",
  "razorpaySignature": "signature_hash",
  "orderId": "uuid-of-order"
}
```

**Response**:
```json
{
  "message": "Payment verified successfully",
  "orderId": "uuid-of-order",
  "transactionId": "pay_abc123",
  "status": "confirmed"
}
```

**Side Effects** (New):
- Sends order confirmation email to customer
- Sends SMS notification (if phone available and preferences allow)
- Generates PDF invoice
- Emails invoice PDF
- Logs all notifications to database

**Error Handling**:
- Payment verified even if notifications fail
- Individual notification failures don't block payment confirmation
- All errors logged for debugging

---

## Summary

✅ **Completed Integration**:
- Enhanced payment verification fetches full order details
- Auto-sends professional HTML email with order summary
- Auto-sends SMS confirmation (if configured)
- Auto-generates PDF invoice
- Auto-emails invoice as attachment
- Respects customer notification preferences
- Logs all notifications for audit trail
- Graceful error handling ensures payment always confirms

✅ **Database Fixed**:
- Created `orders` and `order_items` tables application expects
- Fixed all UUID vs INTEGER mismatches
- Updated payment_logs to use correct data types
- Fixed notification tables foreign key types

✅ **Ready for Testing**:
- All migrations prepared
- Code fully integrated
- Error handling robust
- Documentation complete

🎯 **Next Steps**:
1. Run database migrations (V8, V9, V10, V11)
2. Configure EMAIL_* variables in `.env`
3. Start backend server
4. Test complete payment flow
5. Verify email, SMS, and PDF generation

---

**Questions or Issues?**
Check logs in `server/logs/` directory or contact the development team.
