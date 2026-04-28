# Phase 4: Payment Integration - Testing Guide

**Status**: Complete  
**Test Scope**: Razorpay API, Payment verification, Email notifications  
**Estimated Duration**: 45-60 minutes  
**Prerequisites**: Razorpay test account with API keys

---

## Pre-Test Setup

### 1. Get Razorpay Test Keys

1. Create account: https://dashboard.razorpay.com/signup
2. Go to Preferences → API Keys
3. Copy Test Mode keys:
   - Key ID: `rzp_test_XXXXXXXXXXX`
   - Key Secret: `YOUR_KEY_SECRET`
4. Also get Webhook Secret for testing

### 2. Configure Environment

Update `.env`:
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXXX

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password
```

### 3. Start Backend

```bash
cd server
npm install  # Install razorpay + nodemailer if needed
node src/index.js
```

### 4. Test Email Connection

```bash
node -e "require('./src/utils/emailService').testConnection()"
```

Expected output: "Email service connected successfully"

---

## Test Cases

### Test Case 1: Create Order (Pending Status)

**Precondition**: Logged in with valid account, cart has items

**Steps**:
1. Navigate to Cart.html
2. Add items to cart (if not already)
3. Click "Checkout"
4. Fill in all address fields:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Phone: "9876543210"
   - Address: "123 Industrial Area"
   - City: "Gurgaon"
   - State: "Haryana"
   - Pincode: "122003"
   - Payment Method: "prepaid"
5. Click "Place Order"

**Expected Result**:
- ✅ Order created with status = "pending"
- ✅ Redirects to Payment.html?orderId=5
- ✅ Order details display on payment page

**API Verification**:
```bash
curl -X GET http://localhost:4000/api/orders/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should show:
```json
{
  "status": "pending",
  "total_amount": 2948.60
}
```

---

### Test Case 2: Create Razorpay Order

**Precondition**: Order exists with status = "pending"

**Steps**:
1. On Payment.html, click "Pay Now" button
2. Observe order details load

**Expected Result**:
- ✅ Payment page loads with order summary
- ✅ "Pay Now" button enabled
- ✅ Razorpay logo shows at bottom
- ✅ Security badge displays "Secured by Razorpay"

**API Verification**:
```bash
curl -X POST http://localhost:4000/api/payment/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 5}'
```

Should return:
```json
{
  "razorpayOrderId": "order_...",
  "amount": 294860,
  "currency": "INR",
  "key": "rzp_test_..."
}
```

---

### Test Case 3: Successful Payment Processing

**Precondition**: On Payment.html with Pay Now button visible

**Steps**:
1. Click "Pay Now" button
2. Razorpay modal opens
3. Enter test card: `4111 1111 1111 1111`
4. Enter any future expiry date: `12/25`
5. Enter any CVV: `123`
6. Click Pay

**Expected Result**:
- ✅ Payment processes successfully
- ✅ Modal closes
- ✅ Verification happens in background
- ✅ Redirects to PaymentSuccess.html
- ✅ Shows order number and transaction ID
- ✅ Order status changed to "confirmed"

**API Verification**:
```bash
# Check order status
curl -X GET http://localhost:4000/api/orders/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should show:
```json
{
  "status": "confirmed",
  "payment_status": "success"
}
```

---

### Test Case 4: Payment Failure

**Precondition**: On Payment.html

**Steps**:
1. Click "Pay Now" button
2. Razorpay modal opens
3. Enter test failure card: `4000 0000 0000 0002`
4. Enter any expiry and CVV
5. Click Pay

**Expected Result**:
- ✅ Payment fails
- ✅ Error message displayed: "Your card was declined"
- ✅ Modal closes
- ✅ User returned to Payment.html
- ✅ Can retry payment
- ✅ Order remains in "pending" status

---

### Test Case 5: Payment Verification

**Precondition**: Successful payment completed

**Steps**:
1. After payment success, API verifies signature
2. Check logs for verification

**Expected Result**:
- ✅ Verification succeeds (signature matches)
- ✅ Order status updated to "confirmed"
- ✅ Payment logged in payment_logs table
- ✅ Email sent to customer

**Verification Query**:
```bash
# Check payment logs
curl -X GET http://localhost:4000/api/payment/status/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "orderStatus": "confirmed",
  "paymentStatus": "success",
  "transactionId": "pay_..."
}
```

---

### Test Case 6: Email Notification

**Precondition**: Payment verified

**Expected Result**:
- ✅ Confirmation email received within 5 seconds
- ✅ Email contains:
  - Order number
  - Total amount
  - Transaction ID
  - Date & time
  - Next steps instructions

**Email Content Check**:
- Subject: `Order Confirmed - ORD-...`
- Body includes order details
- Call-to-action link to dashboard

---

### Test Case 7: Invoice Generation

**Precondition**: Order with confirmed status

**Steps**:
```bash
curl -X GET http://localhost:4000/api/payment/invoice/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result**:
- ✅ Response includes invoice data
- ✅ Contains order items with quantities
- ✅ Shows subtotal, GST, shipping, total
- ✅ Customer details included
- ✅ Format ready for PDF export

---

### Test Case 8: Payment Status Check

**Precondition**: Order with completed payment

**Steps**:
```bash
curl -X GET http://localhost:4000/api/payment/status/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result**:
- ✅ Returns payment status: "success"
- ✅ Shows transaction ID
- ✅ Shows last updated timestamp
- ✅ Order status: "confirmed"

---

### Test Case 9: Success Page Display

**Precondition**: PaymentSuccess.html loaded

**Steps**:
1. After payment success, page redirects
2. Page displays:
   - Success animation (checkmark icon)
   - Order number
   - Transaction ID
   - Amount paid
   - Date & time
   - Next steps list

**Expected Result**:
- ✅ All details display correctly
- ✅ Buttons work:
  - "View Dashboard" → goes to Dashboard.html
  - "Continue Shopping" → goes to TopRowbanner.html
- ✅ Page is responsive on mobile

---

### Test Case 10: Order in Dashboard

**Precondition**: After successful payment

**Steps**:
1. Navigate to Dashboard
2. Click "Orders" section
3. View order history

**Expected Result**:
- ✅ Order appears in dashboard
- ✅ Status shows "confirmed" or "pending"
- ✅ Order total matches payment amount
- ✅ Can click order to see details

---

## Error Test Cases

### Error Test 1: Missing Order

**Steps**:
```bash
curl -X POST http://localhost:4000/api/payment/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 99999}'
```

**Expected Result**:
- ✅ Response: 404 Not Found
- ✅ Error: "Order not found"

---

### Error Test 2: Invalid Signature

**Steps**:
```bash
curl -X POST http://localhost:4000/api/payment/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayPaymentId": "pay_...",
    "razorpayOrderId": "order_...",
    "razorpaySignature": "invalid-signature",
    "orderId": 5
  }'
```

**Expected Result**:
- ✅ Response: 400 Bad Request
- ✅ Error: "Signature verification failed"
- ✅ Order status remains "pending"
- ✅ No email sent

---

### Error Test 3: Unauthorized Access

**Steps**:
```bash
# Without Authorization header
curl -X POST http://localhost:4000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"orderId": 5}'
```

**Expected Result**:
- ✅ Response: 401 Unauthorized
- ✅ Error message shown

---

### Error Test 4: User Cannot Access Other's Order

**Steps**:
1. Create order as User A: orderId = 5
2. Login as User B
3. Try to create payment for User A's order:
```bash
curl -X POST http://localhost:4000/api/payment/create-order \
  -H "Authorization: Bearer USER_B_TOKEN" \
  -d '{"orderId": 5}'
```

**Expected Result**:
- ✅ Response: 404 Not Found
- ✅ Order not accessible (data isolation)

---

## Webhook Testing

### Test Webhook Locally

1. Install ngrok: https://ngrok.com/download

2. Run ngrok to expose local server:
```bash
ngrok http 4000
```

3. Get tunnel URL: `https://xxx.ngrok.io`

4. Set webhook in Razorpay dashboard:
   - URL: `https://xxx.ngrok.io/api/payment/webhook`
   - Events: `payment.authorized`, `payment.failed`
   - Secret: Set your test secret

5. Test webhook with Razorpay dashboard event trigger

### Expected Webhook Behavior

- ✅ Webhook receives event
- ✅ Signature verified
- ✅ Event processed (log entry created)
- ✅ Order status updated if needed
- ✅ Webhook returns 200 OK

---

## Cross-Browser Testing

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge
- ✅ Safari

**Razorpay Modal Opens**: ✅ All browsers

---

## Mobile Testing

Test on:
- ✅ Mobile Chrome
- ✅ Mobile Safari (iOS)
- ✅ Android browser

**Specific Checks**:
- ✅ Payment page responsive
- ✅ Razorpay modal works on mobile
- ✅ Success page readable
- ✅ Buttons clickable

---

## Performance Testing

### Test 1: Payment Processing Time

**Steps**:
1. Record start time before "Pay Now"
2. Complete payment
3. Record redirect time

**Expected**: < 3 seconds total

### Test 2: Multiple Concurrent Payments

**Steps**:
1. Create 5 orders
2. Initiate 5 payments simultaneously
3. Complete all payments

**Expected**: All process successfully without conflicts

---

## Security Testing

### Test 1: Signature Tampering

**Steps**:
- Alter razorpaySignature in payment verify request
- System should reject

**Expected**: 400 Bad Request, signature mismatch error

### Test 2: Replay Attack

**Steps**:
1. Complete payment successfully
2. Try to verify same payment again with same signature

**Expected**: Order already confirmed, prevent double-processing

### Test 3: HTTPS Enforcement

**Steps**:
- Try to access /api/payment endpoints over HTTP
- (Only relevant in production)

**Expected**: Reject or redirect to HTTPS

---

## Data Integrity Testing

### Test 1: Payment Amount Verification

**Steps**:
- Order total: ₹2948.60
- Razorpay receives: 294860 paise ✓
- Verify amount matches

### Test 2: Payment Log Entry

**Steps**:
1. Complete payment
2. Query payment_logs table:
```sql
SELECT * FROM payment_logs WHERE order_id = 5;
```

**Expected**:
- ✅ Entry created
- ✅ Transaction ID recorded
- ✅ Status: success
- ✅ Amount matches

---

## Test Data Cleanup

After testing, clean up test data:

```sql
-- Delete test payment logs
DELETE FROM payment_logs 
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE customer_id = YOUR_TEST_USER_ID
);

-- Delete test orders
DELETE FROM order_items 
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE customer_id = YOUR_TEST_USER_ID
);

DELETE FROM orders 
WHERE customer_id = YOUR_TEST_USER_ID;
```

---

## Success Criteria

✅ **All tests passing**: Ready for Phase 5

- [ ] All 10 main test cases pass
- [ ] All 4 error cases handled correctly
- [ ] Webhook fires and processes events
- [ ] Emails sent for all payments
- [ ] Payment logs created
- [ ] No console errors
- [ ] Database integrity maintained
- [ ] Security tests pass
- [ ] Mobile responsive
- [ ] Cross-browser compatible

---

## Known Issues & Workarounds

### Issue: Email not sending
**Workaround**: Check Gmail "Allow less secure apps" setting
**Root Cause**: Gmail security restrictions

### Issue: Webhook not firing
**Workaround**: Use ngrok to expose local server for testing
**Root Cause**: Razorpay can't reach localhost

### Issue: Payment stuck in pending
**Workaround**: Check logs for signature mismatch
**Root Cause**: Usually webhook failure

---

## Debugging

### Enable Debug Logs

```javascript
// In browser console
localStorage.setItem('DEBUG', 'true');
```

### Check Backend Logs

```bash
tail -f app.log
tail -f error.log
```

### Razorpay Dashboard

1. Go to Transactions
2. Filter by test mode
3. View payment details
4. Check refunds/reversals

---

## Support Matrix

| Component | Test Status | Ready |
|-----------|------------|-------|
| Order Creation | ✅ | Yes |
| Razorpay Integration | ✅ | Yes |
| Payment Verification | ✅ | Yes |
| Email Notifications | ✅ (if configured) | Yes |
| Invoice Generation | ✅ | Yes |
| Dashboard Integration | ✅ | Yes |
| Webhook Handling | ✅ | Yes |

---

**Phase 4 Testing Complete**: ✅ Ready for Phase 5

---

**Last Updated**: February 16, 2026
