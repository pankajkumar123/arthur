# Checkout & Order Confirmation Testing Guide

## Overview
This guide explains how to test the complete e-commerce checkout and order confirmation workflow end-to-end.

## Prerequisites
1. **Backend Running:** API server must be running at `http://localhost:4000/api` or deployed at `https://saiscientifics-api.onrender.com/api`
2. **Database:** Orders, OrderItems, Cart tables with proper schema
3. **Test User:** Create a test user account or use existing credentials
4. **Test Product:** Add a ₹1 product to the Products table for testing

## Setup: Create Test Product

Run this SQL to create a 1 rupee test product:

```sql
INSERT INTO products (
  name, description, category, price, stock_quantity, 
  image_url, created_at, updated_at
) VALUES (
  'Test Product - 1 Rupee',
  'This is a test product for payment verification',
  'Testing',
  1.00,
  100,
  'https://via.placeholder.com/300x300?text=Test+Product',
  NOW(),
  NOW()
);
```

## Part 1: Testing Cart & Checkout Page

### Step 1: Navigate to Products and Add Test Product to Cart
1. Open `Products.html`
2. Search for "Test Product - 1 Rupee" or scroll to find it
3. Click on the product card
4. In ProductDetail.html, set quantity to 1
5. Click "Add to Cart"
6. You should see a success notification: **"✓ Product added to cart"**
7. Cart count should increment (visible in header)

### Step 2: Go to Cart
1. Click the shopping cart icon in the header
2. Verify the test product appears in the cart
3. Verify price shows as ₹1.00
4. Click **"Proceed to Checkout"** button

### Step 3: Verify Checkout Page Loads
1. You should be redirected to `Checkout.html`
2. Check that these sections are visible:
   - **Left Side:** Checkout form with step indicator showing "Checkout" (step 2 of 3)
   - **Right Side:** Order Summary sidebar showing:
     - Subtotal: ₹1.00
     - GST (18%): ₹0.18
     - Shipping: ₹0.00 (free for orders <₹5000)
     - **Total: ₹1.18**

### Step 4: Fill Checkout Form
Fill the form with valid data:

```
Full Name:        Test User
Email:           test@example.com
Phone Number:    9876543210
Address:         123 Test Street
City:            Bangalore
State:           Karnataka
Pincode:         560001
```

**Form Validation Testing:**
- Try entering a name with less than 3 characters → Should show error: "Full name must be at least 3 characters"
- Try entering phone with non-digits → Should show error: "Phone must be exactly 10 digits"
- Try email without @ symbol → Should show error: "Invalid email"
- All fields required → Proceed button should be disabled until all filled

### Step 5: Select Payment Method
1. Under "Payment Method", ensure **"Razorpay (Recommended)"** is selected (default)
2. Verify GST Notice displays: **"18% GST included in total amount"**

### Step 6: Click "Proceed to Payment"
1. The form should validate (all fields green ✓)
2. Order should be created in the database (call to `/api/orders/create`)
3. Razorpay payment modal should open with:
   - Amount: ₹1.18 (total with GST)
   - Order ID from Razorpay
   - Your prefilled details (name, email, phone)

## Part 2: Testing Razorpay Payment

### For Test Payment (without actual charge):

**Razorpay Test Cards Available:**
- **Visa Success:** 4111111111111111
- **Visa Failure:** 4000000000000002
- **Mastercard Success:** 5555555555554444

1. In Razorpay modal, enter test card: **4111111111111111**
2. Expiry: Any future date (e.g., 12/25)
3. CVV: Any 3 digits (e.g., 123)
4. Click **Pay**

### Payment Success Flow:
1. You should see success message: **"Your payment was successful"**
2. You should be redirected to `OrderConfirmation.html?orderId=<ORDER_ID>`

### Payment Failure Flow:
1. Try card 4000000000000002
2. Payment should fail
3. You should see error message and option to retry

## Part 3: Testing Order Confirmation Page

### After Successful Payment, OrderConfirmation.html should display:

#### 1. **Success Banner Section**
- ✓ Green checkmark icon (animated entrance)
- "Order Confirmed!" heading
- Message: "Thank you for your purchase..."
- Order number: e.g., **Order #ORD-2024-001234**

#### 2. **Order Details Section**
Verify all these fields are populated:
- **Order Number:** ORD-XXXX-XXXXX (from database)
- **Order Date:** Current date
- **Total Amount:** ₹1.18
- **Payment Status:** "Paid" (green badge) or "Pending" (yellow badge)
- **Order Status:** "Confirmed" (green badge)
- **Expected Delivery:** 5 days from now (calculated)

#### 3. **Delivery Address Section**
Should display exactly what you entered:
- Recipient Name: Test User
- Phone Number: 9876543210
- Address: 123 Test Street, Bangalore, Karnataka - 560001

#### 4. **Invoice Section**

**Invoice Table should show:**

| Product | Qty | Unit Price | Total |
|---------|-----|-----------|-------|
| Test Product - 1 Rupee | 1 | ₹1.00 | ₹1.00 |

**Order Summary Box should show:**
- Subtotal: ₹1.00
- GST (18%): ₹0.18
- Shipping: FREE
- **Total Amount: ₹1.18**

#### 5. **Order Timeline Section**
- ✓ Order Confirmed (completed - green with checkmark)
- ⏳ Order Processing (pending)
- ⏳ Shipped (pending)
- ⏳ Delivered (pending)

#### 6. **Action Buttons**
All buttons should be clickable:
- **View All Orders** → Should navigate to OrderHistory.html
- **Continue Shopping** → Should navigate to Products.html
- **Download Invoice** → Should trigger PDF download
- **Email Invoice** → Should send email and show confirmation
- **Print** button (circle in top-right) → Should open print dialog

## Part 4: Testing Invoice Functions

### Test Download Invoice:
1. Click **"Download Invoice"** button
2. A PDF file should download named: `invoice-<ORDER_ID>.pdf`
3. Open the PDF and verify:
   - Order number matches
   - All products listed correctly
   - Subtotal, tax, total match confirmation page
   - Delivery address matches

### Test Email Invoice:
1. Click **"Email Invoice"** button
2. You should see: **"Invoice sent to your email successfully!"**
3. Check your email inbox (may take 1-2 minutes)
4. Email should contain:
   - Subject: "Your Order Invoice - Order #ORD-XXXX"
   - PDF attachment with invoice

## Part 5: Debugging

### If Checkout Page Doesn't Load:
```
Check browser console for errors:
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for red error messages
4. Common issues:
   - api.js not loading → Check API_BASE is correct
   - Razorpay script not loading → Check internet connection
   - Cart not loading → Check API endpoint `/cart` is working
```

### If Order Number Shows "Loading...":
- Wait 2-3 seconds for API response
- Check browser console for fetch errors
- Verify order was created: Query database for latest order

### If Razorpay Modal Doesn't Open:
- Check browser console for: `[RazorpayObject Error]`
- Verify Razorpay key is correct in api.js
- Clear browser cache and reload
- Try incognito/private window

### If Download Invoice Returns 404:
- Endpoint `/orders/{orderId}/invoice/download` may not exist on backend
- Backend needs this route in `routes/orders.js`
- Temporarily, can generate invoice on frontend using jsPDF

## Part 6: Database Verification

### Check Order Was Created:
```sql
SELECT * FROM orders WHERE customer_id = <USER_ID> ORDER BY created_at DESC LIMIT 1;
```

Expected columns:
```
id, order_number, customer_id, subtotal, gst_amount (0.18), 
shipping_cost (0), total_amount (1.18), payment_method, 
delivery_address, city, state, pincode, status
```

### Check Order Items:
```sql
SELECT * FROM order_items WHERE order_id = <ORDER_ID>;
```

Expected columns:
```
id, order_id, product_id, product_name, quantity (1), 
unit_price (1.00), total_price (1.00)
```

### Check Payment Transaction:
```sql
SELECT * FROM transactions WHERE order_id = <ORDER_ID>;
```

Expected columns:
```
id, order_id, razorpay_payment_id, razorpay_order_id, 
razorpay_signature, status (verified), amount (118 in paise)
```

## Part 7: End-to-End Test Checklist

- [ ] Added test product (₹1)
- [ ] Cart page loads with product
- [ ] Checkout.html form loads with order summary
- [ ] Form validation works (all 7 fields)
- [ ] Order created in database after "Proceed to Payment"
- [ ] Razorpay modal opens with correct amount (₹1.18)
- [ ] Test payment card accepted
- [ ] Redirected to OrderConfirmation.html
- [ ] Order details display on confirmation page
- [ ] Invoice table shows product correctly
- [ ] Order total matches (₹1.18)
- [ ] Timeline shows 4 stages
- [ ] Download Invoice button works
- [ ] Email Invoice button works
- [ ] Cart cleared after order
- [ ] Database records created (orders, order_items, transactions)

## Part 8: Production Testing Checklist

Before deploying to production:

1. **Replace Test Product:** Remove 1 rupee product
2. **Replace Test Cards:** Razorpay test mode → Live mode
3. **Update API_BASE:** Change from localhost to production URL
4. **Update Razorpay Key:** Use live key instead of test key
5. **Email Service:** Test with real email addresses
6. **SMS Service:** Verify Twilio SMS sends correctly
7. **PDF Generation:** Verify invoice PDFs generate properly
8. **Redirect URLs:** Test with production domain
9. **Security:** 
   - Set secure cookies
   - Enable HTTPS everywhere
   - Verify JWT token expiration
   - Test XSS/CSRF protections

## Testing with Different Amounts

To test with different amounts, create more test products:

```sql
INSERT INTO products (name, price) VALUES 
('Test - 5 Rupees', 5.00),
('Test - 100 Rupees', 100.00),
('Test - 1000 Rupees', 1000.00);
```

Then verify GST and shipping calculations:
- ₹5 → GST: ₹0.90, Shipping: ₹0, Total: ₹5.90
- ₹100 → GST: ₹18, Shipping: ₹0, Total: ₹118
- ₹1000 → GST: ₹180, Shipping: ₹0 (order >₹5000), Total: ₹1180

## Support

If issues occur:
1. Check JavaScript console (F12 → Console)
2. Check Network tab to see API responses
3. Check backend logs for errors
4. Query database to verify data creation
5. Contact backend team with error screenshot
