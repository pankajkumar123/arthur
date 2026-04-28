# Phase 5: Email & Notifications - API Quick Reference

**Status**: Complete  
**Base URL**: `http://localhost:4000/api/notifications`  
**Authentication**: JWT Bearer token required for all endpoints

---

## Quick Reference Table

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/preferences` | Get notification settings | JWT |
| PUT | `/preferences` | Update notification settings | JWT |
| PUT | `/preferences/all` | Toggle all notifications | JWT |
| GET | `/summary` | Get dashboard summary | JWT |
| POST | `/send-test` | Send test notification | JWT |
| POST | `/subscribe` | Subscribe to newsletter | JWT |
| POST | `/unsubscribe` | Unsubscribe from newsletter | JWT |
| GET | `/invoice/:orderId` | Get/download invoice | JWT |
| POST | `/send-invoice/:orderId` | Email invoice to customer | JWT |
| GET | `/history` | View notification history | JWT |

---

## Endpoint Details

### 1. Get Notification Preferences
Get customer's current notification settings

```bash
GET /api/notifications/preferences

curl -X GET http://localhost:4000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "preferences": {
    "id": 1,
    "customer_id": 5,
    "email_enabled": true,
    "email_order_confirmation": true,
    "email_shipment_updates": true,
    "email_delivery_confirmation": true,
    "email_promotional": false,
    "email_newsletter": true,
    "email_reviews": true,
    "sms_enabled": true,
    "sms_order_confirmation": true,
    "sms_shipment_tracking": true,
    "sms_promotional": false,
    "sms_otp": true,
    "whatsapp_enabled": false,
    "whatsapp_order_updates": true,
    "whatsapp_promotional": false,
    "whatsapp_support": true,
    "push_enabled": false,
    "do_not_disturb_enabled": true,
    "do_not_disturb_start_time": "22:00:00",
    "do_not_disturb_end_time": "06:00:00",
    "do_not_disturb_timezone": "Asia/Kolkata",
    "promotional_frequency": "weekly",
    "created_at": "2026-02-16T10:30:00Z",
    "updated_at": "2026-02-16T10:30:00Z"
  }
}
```

---

### 2. Update Notification Preferences
Modify notification settings

```bash
PUT /api/notifications/preferences

curl -X PUT http://localhost:4000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_promotional": true,
    "sms_enabled": true,
    "whatsapp_enabled": false,
    "promotional_frequency": "weekly"
  }'
```

**Request Body Fields**:
- `email_enabled`, `email_order_confirmation`, `email_promotional`, etc.
- `sms_enabled`, `sms_order_confirmation`, `sms_promotional`, etc.
- `whatsapp_enabled`, `whatsapp_order_updates`, etc.
- `do_not_disturb_enabled`, `do_not_disturb_start_time`, `do_not_disturb_end_time`
- `promotional_frequency` (daily/weekly/monthly/never)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": { ...updated preferences... }
}
```

---

### 3. Toggle All Notifications
Enable or disable all notifications at once

```bash
PUT /api/notifications/preferences/all

curl -X PUT http://localhost:4000/api/notifications/preferences/all \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "All notifications disabled",
  "preferences": { ...preferences with all disabled... }
}
```

---

### 4. Get Notification Summary
Dashboard view of notification settings

```bash
GET /api/notifications/summary

curl -X GET http://localhost:4000/api/notifications/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "summary": {
    "channels": {
      "email": true,
      "sms": true,
      "whatsapp": false,
      "push": false
    },
    "notifications": {
      "orderUpdates": true,
      "shipmentUpdates": true,
      "promotional": false
    }
  }
}
```

---

### 5. Send Test Notification
Send test email, SMS, or WhatsApp to verify settings

```bash
POST /api/notifications/send-test

curl -X POST http://localhost:4000/api/notifications/send-test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "email"}'
```

**Parameters**:
- `type` (string): "email", "sms", or "whatsapp"

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "result": {
    "success": true,
    "messageId": "msg_1708119885_5"
  }
}
```

**Error Response** (500):
```json
{
  "success": false,
  "message": "Failed to send email: SMTP error",
  "error": "EAUTH"
}
```

---

### 6. Subscribe to Newsletter
Enable newsletter subscription

```bash
POST /api/notifications/subscribe

curl -X POST http://localhost:4000/api/notifications/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

---

### 7. Unsubscribe from Newsletter
Disable newsletter emails

```bash
POST /api/notifications/unsubscribe

curl -X POST http://localhost:4000/api/notifications/unsubscribe \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully unsubscribed from newsletter"
}
```

---

### 8. Get Invoice (JSON)
Retrieve order invoice as JSON data

```bash
GET /api/notifications/invoice/:orderId

curl -X GET http://localhost:4000/api/notifications/invoice/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "INV-1708119885-5",
    "invoiceDate": "16/02/2026",
    "orderId": 5,
    "orderNumber": "ORD-1708119885-5",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "9876543210",
    "customerAddress": "123 Industrial Area, Gurgaon, Haryana 122003",
    "items": [
      {
        "productName": "Industrial Equipment Type A",
        "quantity": 2,
        "unitPrice": 1200.00,
        "lineTotal": 2400.00
      },
      {
        "productName": "Spare Parts Kit B",
        "quantity": 1,
        "unitPrice": 274.30,
        "lineTotal": 274.30
      }
    ],
    "subtotal": 2674.30,
    "gstAmount": 481.37,
    "totalAmount": 3255.67,
    "transactionId": "pay_J8qOE0nLJ1e1SG",
    "paymentMethod": "prepaid",
    "paymentStatus": "success",
    "orderStatus": "confirmed"
  }
}
```

---

### 9. Download Invoice as PDF
Get invoice PDF file (can also use `?format=pdf` parameter)

```bash
GET /api/notifications/invoice/:orderId?format=pdf

curl -X GET "http://localhost:4000/api/notifications/invoice/5?format=pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o invoice-5.pdf
```

**Response**: PDF file (Content-Type: application/pdf)

---

### 10. Send Invoice Email
Email the invoice to customer

```bash
POST /api/notifications/send-invoice/:orderId

curl -X POST http://localhost:4000/api/notifications/send-invoice/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Invoice sent to your email"
}
```

---

### 11. Get Notification History
View past notifications sent to customer

```bash
GET /api/notifications/history?limit=20

curl -X GET "http://localhost:4000/api/notifications/history?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "notifications": [
    {
      "id": 42,
      "customer_id": 5,
      "notification_type": "order_confirmation",
      "channel": "email",
      "subject": "Order Confirmed - ORD-1708",
      "message": "Your order...",
      "order_id": 5,
      "recipient_address": "john@example.com",
      "delivery_status": "delivered",
      "is_read": true,
      "created_at": "2026-02-16T10:30:00Z",
      "sent_at": "2026-02-16T10:30:05Z"
    }
  ]
}
```

---

## Channel Capabilities

### Email
- ✅ Order confirmations
- ✅ Shipment tracking
- ✅ Delivery notifications
- ✅ Promotional offers
- ✅ Newsletter
- ✅ Support responses
- ✅ Invoice distribution
- ✅ HTML templates with tracking
- ✅ Open/click tracking
- ✅ Do Not Disturb support

### SMS
- ✅ Order confirmations (short)
- ✅ Tracking updates
- ✅ Delivery confirmations
- ✅ OTP delivery
- ✅ Payment reminders
- ✅ Promotional alerts (limited)
- ✅ 160-character limit per SMS
- ✅ Rate limiting built-in
- ✅ Delivery confirmation
- ✅ Cost tracking

### WhatsApp
- ✅ Order status updates
- ✅ Tracking information
- ✅ Promotional offers
- ✅ Support messages
- ✅ Rich formatting
- ✅ Media support (images)
- ✅ Delivery status
- ✅ Template messages

### PDF Invoices
- ✅ JSON export
- ✅ PDF generation
- ✅ Email distribution
- ✅ Download link
- ✅ Professional layout
- ✅ GST calculation
- ✅ Payment details
- ✅ Order history

---

## Preference Categories

### Channels (On/Off)
- `email_enabled` - All email notifications
- `sms_enabled` - All SMS notifications
- `whatsapp_enabled` - All WhatsApp messages
- `push_enabled` - Push notifications (future)

### Notification Types (Per Channel)
- `*_order_confirmation` - Order received
- `*_shipment_updates` - Tracking info
- `*_delivery_confirmation` - Order delivered
- `*_promotional` - Marketing offers
- `*_reviews` - Review requests

### Special Settings
- `email_newsletter` - Weekly/daily digest
- `sms_otp` - One-time passwords
- `whatsapp_support` - Support responses

### Do Not Disturb
- `do_not_disturb_enabled` - Quiet hours active
- `do_not_disturb_start_time` - Ex: "22:00"
- `do_not_disturb_end_time` - Ex: "06:00"
- `do_not_disturb_timezone` - Ex: "Asia/Kolkata"

### Frequency Control
- `promotional_frequency` - "daily", "weekly", "monthly", "never"

---

## Error Codes

| Status | Code | Message | Action |
|--------|------|---------|--------|
| 400 | VALIDATION_ERROR | Missing required fields | Check request body |
| 401 | AUTH_FAILED | Invalid/missing token | Login again |
| 404 | NOT_FOUND | Order/customer not found | Verify ID |
| 500 | EMAIL_FAILED | Failed to send email | Check email config |
| 500 | SMS_FAILED | Twilio error | Check Twilio setup |
| 500 | PDF_ERROR | Invoice generation failed | Check disk space |

---

## Testing Checklist

- [ ] Create test account
- [ ] Get JWT token
- [ ] Fetch current preferences
- [ ] Update one preference setting
- [ ] Send test email
- [ ] Send test SMS (if Twilio configured)
- [ ] Get invoice JSON
- [ ] Download invoice PDF
- [ ] Send invoice email
- [ ] Check notification history
- [ ] Verify DND time not sending promos
- [ ] Test all channel toggles
- [ ] Subscribe to newsletter
- [ ] Verify email received

---

## Troubleshooting

### Email test fails
Check `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password
EMAIL_FROM=Sai Scientifics <your-email@gmail.com>
```

### SMS test fails
Check Twilio setup:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=token_here
TWILIO_PHONE_FROM=+1234567890
```

### Invoice download fails
Ensure:
- Order exists for customer
- /uploads directory writable
- PDFKit installed: `npm list pdfkit`

### Preference update doesn't persist
Verify:
- JWT token valid
- notification_preferences table exists
- Database connection working

---

**Total Endpoints**: 11  
**Total Database Tables**: 8  
**Authentication**: JWT required  
**Rate Limiting**: 100 requests/15min per endpoint

