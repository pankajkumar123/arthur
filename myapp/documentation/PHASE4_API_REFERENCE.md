# Phase 4: Payment Integration - API Reference

**Status**: Complete  
**Date**: February 16, 2026  
**Environment**: Test/Production  
**Base URL**: `http://localhost:4000/api` (development)

---

## Quick Reference

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/payment/create-order` | Create Razorpay order object | JWT |
| POST | `/payment/verify` | Verify payment signature, confirm order | JWT |
| POST | `/payment/webhook` | Razorpay webhook events (async) | Webhook |
| GET | `/payment/status/:orderId` | Get payment/order status | JWT |
| GET | `/payment/invoice/:orderId` | Download invoice JSON | JWT |

---

## 1. Create Razorpay Order

Create a Razorpay payment order from an existing pending order.

### Request

```http
POST /payment/create-order HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "orderId": 5
}
```

### Parameters

| Name | Type | Description | Required |
|------|------|-------------|----------|
| `orderId` | integer | Order ID from orders table | Yes |

### Response (200 OK)

```json
{
  "success": true,
  "razorpayOrderId": "order_L9QXcOiLLBrtMa",
  "amount": 294860,
  "currency": "INR",
  "key": "rzp_test_xxxxxxxxxxx",
  "message": "Order created successfully"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Operation success status |
| `razorpayOrderId` | string | Razorpay Order ID for checkout |
| `amount` | integer | Amount in paise (multiply by 100) |
| `currency` | string | Currency code (always INR) |
| `key` | string | Razorpay Public Key for frontend |
| `message` | string | Success message |

### Error Responses

**404 Not Found** - Order doesn't exist
```json
{
  "success": false,
  "message": "Order not found",
  "error": "ORDER_NOT_FOUND"
}
```

**400 Bad Request** - Order not in pending status
```json
{
  "success": false,
  "message": "Order is not in pending status",
  "error": "INVALID_ORDER_STATUS"
}
```

**401 Unauthorized** - Missing/invalid JWT
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "AUTH_FAILED"
}
```

### curl Example

```bash
curl -X POST http://localhost:4000/api/payment/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 5
  }'
```

### JavaScript Example

```javascript
const createOrder = async (orderId) => {
  const response = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ orderId })
  });
  
  const data = await response.json();
  return data;
};
```

---

## 2. Verify Payment

Verify Razorpay payment signature and confirm the order.

### Request

```http
POST /payment/verify HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "razorpayPaymentId": "pay_L9QXxaB2llBj7j",
  "razorpayOrderId": "order_L9QXcOiLLBrtMa",
  "razorpaySignature": "5a5f3a3d5b5f5a5f5a5f5a5f5a5f5a5f5a5f5a5f",
  "orderId": 5
}
```

### Parameters

| Name | Type | Description | Required |
|------|------|-------------|----------|
| `razorpayPaymentId` | string | Payment ID from Razorpay | Yes |
| `razorpayOrderId` | string | Order ID from Razorpay | Yes |
| `razorpaySignature` | string | HMAC-SHA256 signature | Yes |
| `orderId` | integer | Local order ID | Yes |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "orderId": 5,
  "transactionId": "pay_L9QXxaB2llBj7j",
  "orderStatus": "confirmed",
  "paymentStatus": "success"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Verification successful |
| `message` | string | Status message |
| `orderId` | integer | Local order ID |
| `transactionId` | string | Payment transaction ID |
| `orderStatus` | string | Order status (confirmed/failed) |
| `paymentStatus` | string | Payment status (success/failed) |

### Error Responses

**400 Bad Request** - Signature verification failed
```json
{
  "success": false,
  "message": "Signature verification failed",
  "error": "SIGNATURE_MISMATCH"
}
```

**404 Not Found** - Order doesn't exist
```json
{
  "success": false,
  "message": "Order not found",
  "error": "ORDER_NOT_FOUND"
}
```

**400 Bad Request** - Already confirmed
```json
{
  "success": false,
  "message": "Order already confirmed",
  "error": "ALREADY_CONFIRMED"
}
```

### curl Example

```bash
curl -X POST http://localhost:4000/api/payment/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayPaymentId": "pay_L9QXxaB2llBj7j",
    "razorpayOrderId": "order_L9QXcOiLLBrtMa",
    "razorpaySignature": "5a5f3a3d5b5f5a5f5a5f5a5f5a5f5a5f5a5f5a5f",
    "orderId": 5
  }'
```

### JavaScript Example (Frontend)

```javascript
const verifyPayment = async (paymentData) => {
  const response = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      razorpayPaymentId: paymentData.razorpay_payment_id,
      razorpayOrderId: paymentData.razorpay_order_id,
      razorpaySignature: paymentData.razorpay_signature,
      orderId: window.orderId // From URL parameter
    })
  });
  
  return response.json();
};
```

---

## 3. Webhook Handler

Razorpay sends async webhook events to this endpoint.

### Request (From Razorpay)

```http
POST /payment/webhook HTTP/1.1
Host: your-domain.com
Content-Type: application/json
X-Razorpay-Signature: 5a5f3a3d5b5f5a5f5a5f5a5f5a5f5a5f

{
  "event": "payment.authorized",
  "created_at": 1613398274,
  "entity": "event",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_L9QXxaB2llBj7j",
        "entity": "payment",
        "amount": 294860,
        "currency": "INR",
        "status": "authorized",
        "order_id": "order_L9QXcOiLLBrtMa"
      }
    }
  }
}
```

### Supported Events

| Event | Description | Action |
|-------|-------------|--------|
| `payment.authorized` | Payment successful | Log payment, update status |
| `payment.failed` | Payment declined | Log failure |
| `payment.captured` | Manual capture | Update status |
| `order.paid` | Full order paid | Confirm order |
| `refund.created` | Refund initiated | Log refund |

### Response (200 OK)

```json
{
  "received": true
}
```

**Note**: Must respond with 200 OK within 5 seconds or Razorpay will retry.

### Webhook Setup (Razorpay Dashboard)

1. Go to Dashboard → Webhooks
2. Add Webhook URL: `https://your-domain.com/api/payment/webhook`
3. Secret: Generate and save securely
4. Events: Select required events
5. Active: Enable webhook

### curl Example (Testing)

```bash
# Requires valid signature computed from webhook secret
curl -X POST http://localhost:4000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: YOUR_SIGNATURE" \
  -d '{
    "event": "payment.authorized",
    "created_at": 1613398274,
    "entity": "event",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_L9QXxaB2llBj7j",
          "status": "authorized",
          "order_id": "order_L9QXcOiLLBrtMa"
        }
      }
    }
  }'
```

---

## 4. Get Payment Status

Check payment and order status.

### Request

```http
GET /payment/status/5 HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### URL Parameters

| Name | Type | Description | Required |
|------|------|-------------|----------|
| `orderId` | integer | Order ID to check | Yes |

### Response (200 OK)

```json
{
  "success": true,
  "orderId": 5,
  "orderStatus": "confirmed",
  "paymentStatus": "success",
  "transactionId": "pay_L9QXxaB2llBj7j",
  "razorpayOrderId": "order_L9QXcOiLLBrtMa",
  "amount": 294860,
  "currency": "INR",
  "paidAt": "2026-02-16T10:30:45.123Z",
  "customerEmail": "user@example.com",
  "customerPhone": "9876543210"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `orderId` | integer | Local order ID |
| `orderStatus` | string | Order status (pending/confirmed/shipped/cancelled) |
| `paymentStatus` | string | Payment status (pending/success/failed) |
| `transactionId` | string | Razorpay Payment ID |
| `razorpayOrderId` | string | Razorpay Order ID |
| `amount` | integer | Amount in paise |
| `paidAt` | string | Payment timestamp (ISO 8601) |
| `customerEmail` | string | Customer email |
| `customerPhone` | string | Customer phone |

### Error Responses

**404 Not Found** - Order doesn't exist
```json
{
  "success": false,
  "message": "Order not found",
  "error": "ORDER_NOT_FOUND"
}
```

**401 Unauthorized** - Not authenticated
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "AUTH_FAILED"
}
```

### curl Example

```bash
curl -X GET http://localhost:4000/api/payment/status/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript Example

```javascript
const getPaymentStatus = async (orderId) => {
  const response = await fetch(`/api/payment/status/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.json();
};
```

---

## 5. Get Invoice

Download order invoice as JSON.

### Request

```http
GET /payment/invoice/5 HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### URL Parameters

| Name | Type | Description | Required |
|------|------|-------------|----------|
| `orderId` | integer | Order ID | Yes |

### Response (200 OK)

```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "INV-1708119885-5",
    "orderId": 5,
    "orderDate": "2026-02-16T09:45:00Z",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "9876543210",
    "customerAddress": "123 Industrial Area, Gurgaon, HR 122003",
    "items": [
      {
        "productId": 2,
        "productName": "Industrial Equipment Type A",
        "quantity": 2,
        "unitPrice": 1200.00,
        "lineTotal": 2400.00
      },
      {
        "productId": 5,
        "productName": "Spare Parts Kit B",
        "quantity": 1,
        "unitPrice": 274.30,
        "lineTotal": 274.30
      }
    ],
    "subtotal": 2674.30,
    "gstRate": 18,
    "gstAmount": 481.37,
    "shippingCharges": 100.00,
    "discountAmount": 0,
    "totalAmount": 3255.67,
    "paymentMethod": "prepaid",
    "transactionId": "pay_L9QXxaB2llBj7j",
    "paymentStatus": "success",
    "orderStatus": "confirmed"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `invoiceNumber` | string | Unique invoice ID |
| `orderId` | integer | Order ID |
| `orderDate` | string | Order creation timestamp |
| `customerName` | string | Customer full name |
| `customerEmail` | string | Customer email |
| `customerAddress` | string | Delivery address |
| `items` | array | Order line items |
| `subtotal` | float | Sum before GST |
| `gstRate` | integer | GST percentage (18) |
| `gstAmount` | float | Calculated GST |
| `shippingCharges` | float | Shipping cost |
| `totalAmount` | float | Final amount paid |
| `transactionId` | string | Payment transaction ID |

### Error Responses

**404 Not Found** - Order doesn't exist
```json
{
  "success": false,
  "message": "Order not found",
  "error": "ORDER_NOT_FOUND"
}
```

### curl Example

```bash
curl -X GET http://localhost:4000/api/payment/invoice/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript Example

```javascript
const downloadInvoice = async (orderId) => {
  const response = await fetch(`/api/payment/invoice/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const data = await response.json();
  
  // Convert to PDF or download as JSON
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data.invoice)));
  element.setAttribute('download', `Invoice-${orderId}.json`);
  element.click();
};
```

---

## Authentication

All endpoints (except webhook) require JWT Bearer token.

### Get JWT Token

**Login endpoint** (from Phase 2):

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Use Token

Add to all subsequent requests:
```
Authorization: Bearer <token>
```

### Token Expiry

- Duration: 7 days
- Refresh: Login again to get new token
- If expired: 401 Unauthorized response

---

## Error Codes

| Code | HTTP | Description | Action |
|------|------|-------------|--------|
| `ORDER_NOT_FOUND` | 404 | Order doesn't exist | Check order ID |
| `INVALID_ORDER_STATUS` | 400 | Order not pending | Cancel and create new |
| `SIGNATURE_MISMATCH` | 400 | Payment signature invalid | Retry payment |
| `ALREADY_CONFIRMED` | 400 | Order already paid | Check dashboard |
| `AUTH_FAILED` | 401 | Invalid/missing token | Login again |
| `RAZORPAY_ERROR` | 500 | Razorpay API error | Retry or contact support |
| `EMAIL_FAILED` | 500 | Email notification failed | Check email service logs |

---

## Rate Limiting

All endpoints (except webhook) have rate limiting:
- **Limit**: 100 requests per 15 minutes per user
- **Reset**: Every 15 minutes
- **Headers**: 
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1613400000`

Rate limit exceeded:
```json
{
  "success": false,
  "message": "Too many requests",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

---

## Testing Endpoints

### Test Card Numbers

| Status | Card Number | Expiry | CVV |
|--------|------------|--------|-----|
| Success | 4111 1111 1111 1111 | Any future | Any 3 digits |
| Failure | 4000 0000 0000 0002 | Any future | Any 3 digits |
| 3D Secure | 4111 1111 1111 1111 | 12/25 | 100 |

### Test Environment

```
Razorpay Dashboard: https://dashboard.razorpay.com
API Keys: In Settings → API Keys (Test/Live mode toggle)
Test Amounts: Use any amount (automatically captured)
```

---

## Integration Checklist

- [ ] Get Razorpay API keys (test mode)
- [ ] Set environment variables (.env)
- [ ] Install `razorpay` package
- [ ] Install `nodemailer` package
- [ ] Create payment_logs table
- [ ] Test /api/payment/create-order
- [ ] Test /api/payment/verify
- [ ] Test /api/payment/status
- [ ] Test /api/payment/invoice
- [ ] Configure webhook URL
- [ ] Test email notifications
- [ ] Load test payment flow
- [ ] Move to production keys

---

**Last Updated**: February 16, 2026  
**Version**: 1.0  
**Team**: Development Team
