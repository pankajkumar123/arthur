# 🛍️ Complete Purchase Journey Guide

## Your Real-Time E-Commerce Experience

Hello **Umesh Cholleti**! Follow these steps to complete your purchase with invoice delivery.

---

## Step 1️⃣: Login to Your Account

**Go to:** `http://localhost:5173/Login.html`

**Login Details:**
- **Email:** `umeshcholleti25@gmail.com`
- **Password:** `Umesh@12345`

**Expected Result:**
- You'll see a success notification: ✓ Login successful
- You'll be redirected to the Dashboard or Products page
- Your name should appear in the header

---

## Step 2️⃣: Browse and Find the ₹1 Test Product

**Go to:** `http://localhost:5173/Products.html`

**Look for:** "Test Product - 1 Rupee"

**Product Details:**
- Name: Test Product - 1 Rupee
- Price: ₹1.00
- Description: Testing checkout and payment flow
- Category: Testing

**Action:** Click on the product card to view details

---

## Step 3️⃣: Add Product to Cart

**On ProductDetail.html page:**

1. Set Quantity: **1**
2. Click **"Add to Cart"** button
3. You should see: ✓ Product added to cart

**Expected:**
- Cart count increments (visible in header)
- Toast notification confirms addition

---

## Step 4️⃣: Go to Shopping Cart

**On Products page:**
1. Click the **shopping cart icon** (🛒) in the header
2. Or navigate to: `http://localhost:5173/Cart.html`

**Verify:**
- Your Test Product shows with price ₹1.00
- Quantity: 1
- Option to modify quantity or remove

**Action:** Click **"Proceed to Checkout"** button (green button at bottom)

---

## Step 5️⃣: Complete Checkout Form

**On Checkout.html page, fill the delivery form:**

### Form Fields:

| Field | Your Value | Notes |
|-------|-----------|-------|
| **Full Name** | Umesh Cholleti | Min 3 characters ✓ |
| **Email** | umeshcholleti25@gmail.com | Valid email format ✓ |
| **Phone** | 9876543210 | Exactly 10 digits ✓ |
| **Address** | Your Home Address | Min 5 characters ✓ |
| **City** | Bangalore | City where you want delivery |
| **State** | Karnataka | Select from dropdown ✓ |
| **Pincode** | 560001 | Exactly 6 digits ✓ |

### Form Validation:
- Each field will show a **green checkmark (✓)** when valid
- Do NOT proceed until all fields are green

### Order Summary (Right Side):
You should see:
```
Subtotal:           ₹1.00
GST (18%):          ₹0.18
Shipping:           FREE (Order < ₹5000)
────────────────────────────
Total Amount:       ₹1.18
```

---

## Step 6️⃣: Select Payment Method

**On the same Checkout page:**

1. **Payment Method:** Select **"Razorpay (Recommended)"** (should be default)
2. Notice: **"18% GST included in total amount"** banner
3. Review: Trust badges at bottom (100% Authentic, Secure Checkout)
4. **Action:** Click **"Proceed to Payment"** button

---

## Step 7️⃣: Complete Razorpay Payment

### Razorpay Modal Will Open

You'll see a payment form with:
- Order Amount: **₹1.18**
- Your prefilled details (Name, Email, Phone)

### Enter Test Card Details:

**Card Information:**
```
Credit Card Number:  4111111111111111
Expiry Date:         12/25 (or any future date)
CVV:                 123 (any 3 digits)
```

**Steps:**
1. Enter card number: **4111111111111111**
2. Enter expiry: **12/25**
3. Enter CVV: **123**
4. Click **"Submit"** or **"Pay"** button
5. Payment will be processed instantly

### Payment Success ✅
You'll see:
- ✓ Payment successful message
- Automatic redirect after 2-3 seconds

---

## Step 8️⃣: Order Confirmation Page

**You'll be redirected to: `OrderConfirmation.html`**

### See Your Order Confirmation:

#### Success Banner:
```
🟢 Order Confirmed!
Order #ORD-2024-001234
Thank you for your purchase. 
Confirmation email sent to umeshcholleti25@gmail.com
```

#### Order Details:
```
Order Number:      ORD-2024-001234
Order Date:        Feb 23, 2026
Total Amount:      ₹1.18
Payment Status:    ✅ Paid (green badge)
Order Status:      Confirmed (green badge)
Expected Delivery: Feb 28, 2026 (5 days)
```

#### Delivery Address:
```
Recipient Name:    Umesh Cholleti
Phone:             9876543210
Address:           Your Address
                   Bangalore, Karnataka - 560001
```

#### Invoice Table:
```
Product:           Test Product - 1 Rupee
Quantity:          1
Unit Price:        ₹1.00
Total:             ₹1.00
```

#### Order Summary:
```
Subtotal:          ₹1.00
GST (18%):         ₹0.18
Shipping:          FREE
─────────────────────────────
Total Amount:      ₹1.18
```

#### Order Timeline:
```
✅ Order Confirmed        (Just now)
⏳ Order Processing       (Next 24 hours)
⏳ Shipped                (Preparing for shipment)
⏳ Delivered              (Coming soon)
```

---

## Step 9️⃣: Download Invoice

**On Order Confirmation Page:**

1. Scroll to bottom
2. Click **"Download Invoice"** button (blue button with 📥 icon)
3. A PDF file will download: `invoice-ORD-2024-001234.pdf`
4. Open the PDF to view your complete invoice

### Invoice Contains:
✅ Company Name: **Sai Scientifics**
✅ Company Address: Your Company Address
✅ Company Phone: +91-XXXXXXXXXX
✅ Company Email: contactus@saiscientifics.com
✅ GST Number: **27AAACR5055K1Z0** (example)
✅ Order Number: ORD-2024-001234
✅ Order Date: Feb 23, 2026
✅ Delivery Address: Your full address with city/state/pincode
✅ Item Details: Product name, quantity, price, tax
✅ Amount Breakdown: Subtotal, GST, Shipping, Total
✅ Payment Status: PAID

---

## Step 1️⃣0️⃣: Receive Invoice via Email

**On Order Confirmation Page:**

1. Click **"Email Invoice"** button (blue button with 📧 icon)
2. You should see confirmation: **"Invoice sent to your email successfully!"**
3. Check your email inbox: `umeshcholleti25@gmail.com`
4. Email may take 1-2 minutes to arrive

### Email Contents:
```
From:     contactus@saiscientifics.com
Subject:  Your Order Invoice - Order #ORD-2024-001234
To:       umeshcholleti25@gmail.com

Body:
✅ Thank you for your purchase!
✅ Your order has been confirmed
✅ Invoice PDF attached
✅ Track your order status
✅ Customer support contact

Attachment: invoice-ORD-2024-001234.pdf (with all details)
```

---

## Step 1️⃣1️⃣: Add Delivery Address (If Different)

**If you want to save multiple addresses for future orders:**

1. Go to your **Dashboard** or **Profile**
2. Click **"Manage Addresses"**
3. Click **"Add New Address"**
4. Enter:
   - Address Type: Home/Work/Other
   - Full Address: Your street address
   - City: Bangalore
   - State: Karnataka
   - Pincode: 560001
   - Phone: 9876543210
5. Click **"Save Address"**
6. On next checkout, you can select from saved addresses

---

## 🎉 Success Checklist

### After completing all steps, verify:

✅ **Login:** Successfully logged in with your email
✅ **Product:** Added ₹1 test product to cart
✅ **Cart:** Viewed cart with product details
✅ **Checkout:** Filled 7-field form with validation
✅ **Payment:** Completed Razorpay payment with test card
✅ **Confirmation:** Received order confirmation page
✅ **Order Details:** All order information displayed correctly
✅ **Invoice:** Downloaded invoice PDF with company details & GST
✅ **Email:** Received invoice email at umeshcholleti25@gmail.com
✅ **Database:** Order saved in system with order number
✅ **Happy:** Feel proud of your first successful e-commerce purchase! 🎊

---

## 💡 Pro Tips

1. **Order Tracking:** On confirmation page, watch the 4-stage timeline update as your order progresses
2. **Print Invoice:** Click the print button (🖨️) in top-right corner to print invoice on paper
3. **View All Orders:** Click "View All Orders" to see your order history in OrderHistory.html
4. **Continue Shopping:** After purchase, click "Continue Shopping" to buy more products
5. **Customer Support:** Email contactus@saiscientifics.com with your order number for any queries

---

## 🔧 Troubleshooting

### If Login fails:
- Check email is exactly: `umeshcholleti25@gmail.com`
- Check password is exactly: `Umesh@12345`
- Clear browser cookies and try again

### If Product not found:
- Refresh Products.html page
- Search for "Test Product"
- If not found, admin needs to create it in database

### If Checkout form doesn't validate:
- Check all 7 fields are filled correctly
- Phone must be exactly 10 digits
- Pincode must be exactly 6 digits
- Wait for form to validate (green checkmarks appear)

### If Razorpay modal doesn't open:
- Check internet connection
- Ensure card details entered correctly
- Try different test card: 5555555555554444

### If Invoice email doesn't arrive:
- Check spam/junk folder
- Check that email is correct
- Wait 2-3 minutes (may be delayed)
- Contact support with order number

---

## 📞 Get Support

**Order Number:** ORD-2024-001234 (example)
**Email:** contactus@saiscientifics.com
**Phone:** +91-XXXXXXXXXX
**Hours:** 9 AM - 6 PM IST, Monday-Friday

---

## Ready to Begin? 🚀

**Start Here:** Open your browser and navigate to:

```
Login Page: http://localhost:5173/Login.html
```

**Login with:**
- Email: umeshcholleti25@gmail.com
- Password: Umesh@12345

**Then follow the 11 steps above for a smooth purchasing experience!**

---

**Generated:** February 23, 2026
**Status:** All systems ready for your purchase! ✅
**Enjoy your shopping! 🛍️**
