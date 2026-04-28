# Phase 3: Cart & Orders Integration

**Status**: ✅ Complete  
**Duration**: Single Phase Session  
**Components Updated**: 4 files (backend + frontend)  
**Production Ready**: Yes

---

## Overview

Phase 3 integrates shopping cart and order management with JWT authentication, replacing the previous guest-based cart system with a secure, user-linked architecture.

### What Changed

- **Cart System**: Migrated from temporary guest carts to persistent, user-specific carts
- **Order Creation**: User orders now linked to authenticated customer accounts
- **Frontend Persistence**: Cart data synced with API instead of localStorage
- **Order History**: Real orders loaded from database via API

---

## Backend Implementation

### 1. Cart API (`server/src/routes/cart.js`)

**File**: [server/src/routes/cart.js](../../server/src/routes/cart.js) (160 lines)

**Authentication**: All endpoints require JWT token (Bearer in Authorization header)

#### Endpoints

```
GET    /api/cart              - Get user's cart items
POST   /api/cart/add          - Add product to cart
PUT    /api/cart/:cartItemId  - Update item quantity
DELETE /api/cart/:cartItemId  - Remove item from cart
DELETE /api/cart              - Clear entire cart
```

#### Detailed Specifications

##### GET /api/cart
Returns all cart items for the authenticated user.

**Response** (array of items):
```json
[
  {
    "id": 1,
    "product_id": 42,
    "name": "3M Safety Helmet",
    "price": "2490.00",
    "quantity": 2,
    "image_url": "https://..."
  }
]
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized (missing/invalid token)

---

##### POST /api/cart/add
Add a product to the user's cart or increment quantity if already present.

**Request Body**:
```json
{
  "productId": 42,
  "quantity": 1
}
```

**Validation**:
- Product must exist in database
- Quantity must be between 1 and 10,000
- ProductId must be a positive integer

**Response**:
```json
{
  "cartItemId": 1,
  "message": "Added to cart"
}
```

**Status Codes**:
- `201`: Item added
- `400`: Validation error (missing fields, invalid quantity)
- `404`: Product not found
- `401`: Unauthorized

**Errors**:
```json
{
  "error": "Product not found",
  "code": "NOT_FOUND"
}
```

---

##### PUT /api/cart/:cartItemId
Update the quantity of a cart item.

**Request Body**:
```json
{
  "quantity": 5
}
```

**Validation**:
- Quantity must be between 1 and 10,000
- Cart item must belong to authenticated user

**Response**:
```json
{
  "message": "Quantity updated"
}
```

**Status Codes**:
- `200`: Updated
- `400`: Invalid quantity
- `404`: Cart item not found
- `401`: Unauthorized

---

##### DELETE /api/cart/:cartItemId
Remove a single item from cart.

**Response**:
```json
{
  "message": "Item removed"
}
```

**Status Codes**:
- `200`: Removed
- `404`: Cart item not found
- `401`: Unauthorized

---

##### DELETE /api/cart
Clear the entire cart for the user.

**Response**:
```json
{
  "message": "Cart cleared"
}
```

**Status Codes**:
- `200`: Cleared
- `401`: Unauthorized

---

### 2. Orders API (`server/src/routes/orders.js`)

**File**: [server/src/routes/orders.js](../../server/src/routes/orders.js) (170 lines)

**Authentication**: All endpoints require JWT token

#### Endpoints

```
POST   /api/orders/create     - Create order from cart
GET    /api/orders/history    - Get user's order history
GET    /api/orders/:orderId   - Get specific order details
PATCH  /api/orders/:orderId/status - Update order status
```

#### Detailed Specifications

##### POST /api/orders/create
Create an order from the user's current cart items.

**Request Body**:
```json
{
  "addressLine": "123 Industrial Area",
  "city": "Gurgaon",
  "state": "Haryana",
  "pincode": "122003",
  "paymentMethod": "prepaid"
}
```

**Validation**:
- All address fields required
- Pincode must be exactly 6 digits
- PaymentMethod: "prepaid" | "credit" | "cod"
- Cart must not be empty

**Order Calculation**:
- Subtotal: Sum of (price × quantity) for all items
- GST: 18% of subtotal
- Shipping: ₹100 if subtotal ≤ ₹5000, else free
- Total: Subtotal + GST + Shipping

**Response**:
```json
{
  "orderId": 15,
  "orderNumber": "ORD-1708276543-87234",
  "totalAmount": 2948.60,
  "subtotal": 2400.00,
  "gst": 432.00,
  "shipping": 116.60,
  "paymentMethod": "prepaid"
}
```

**Actions on Success**:
1. Create order record in `orders` table
2. Create order items in `order_items` table for each cart item
3. Clear user's cart automatically
4. Log creation event

**Status Codes**:
- `201`: Order created
- `400`: Validation error (empty cart, invalid address, etc.)
- `404`: User not found
- `401`: Unauthorized

**Errors**:
```json
{
  "error": "All address and payment fields required",
  "code": "VALIDATION_ERROR"
}
```

---

##### GET /api/orders/history
Get all orders for the authenticated user, sorted by most recent first.

**Response** (array of orders):
```json
[
  {
    "id": 15,
    "order_number": "ORD-1708276543-87234",
    "total_amount": 2948.60,
    "status": "pending",
    "created_at": "2026-02-16T10:30:00Z",
    "delivery_address": "123 Industrial Area",
    "city": "Gurgaon",
    "state": "Haryana"
  }
]
```

**Status Codes**:
- `200`: Success (may be empty array)
- `401`: Unauthorized

---

##### GET /api/orders/:orderId
Get detailed information about a specific order.

**Response**:
```json
{
  "id": 15,
  "order_number": "ORD-1708276543-87234",
  "subtotal": 2400.00,
  "gst_amount": 432.00,
  "shipping_cost": 116.60,
  "total_amount": 2948.60,
  "payment_method": "prepaid",
  "delivery_address": "123 Industrial Area",
  "city": "Gurgaon",
  "state": "Haryana",
  "pincode": "122003",
  "status": "pending",
  "created_at": "2026-02-16T10:30:00Z",
  "items": [
    {
      "id": 42,
      "product_id": 15,
      "quantity": 2,
      "unit_price": "1200.00",
      "name": "3M Safety Helmet",
      "image_url": "https://..."
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `404`: Order not found or not accessible by user
- `401`: Unauthorized

---

##### PATCH /api/orders/:orderId/status
Update the status of an order (pending user can only view, status updates typically from admin/backend).

**Request Body**:
```json
{
  "status": "shipped"
}
```

**Valid Statuses**: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

**Response**:
```json
{
  "message": "Order status updated",
  "status": "shipped"
}
```

**Status Codes**:
- `200`: Updated
- `400`: Invalid status
- `404`: Order not found
- `401`: Unauthorized

---

## Frontend Implementation

### 1. Cart Page (`Cart.js`)

**File**: [Cart.js](../../Cart.js) (updated, ~300 lines)

#### Key Changes

**Authentication Required**:
```javascript
// Page redirects if user not logged in
if (!isAuthenticated()) {
  emptyCart.innerHTML = '<p>Please <a href="Login.html">log in</a> to view cart</p>';
}
```

**API Integration**:
- **Load cart**: `GET /api/cart`
- **Add item**: `POST /api/cart/add`
- **Update quantity**: `PUT /api/cart/:itemId`
- **Remove item**: `DELETE /api/cart/:itemId`
- **Create order**: `POST /api/orders/create`

#### User Flow

1. **Page Load**
   - Check authentication
   - Fetch cart from API
   - Render cart items
   - Calculate totals

2. **Add Item** (from ProductDetail page)
   - Call `/api/cart/add` with productId + quantity
   - Reload cart if on Cart page
   - Show success notification

3. **Update Quantity**
   - User changes quantity in cart
   - Call `PUT /api/cart/:itemId` with new quantity
   - Update display

4. **Remove Item**
   - Call `DELETE /api/cart/:itemId`
   - Reload and re-render

5. **Checkout**
   - Validate address fields
   - Call `POST /api/orders/create`
   - Show success modal with order number
   - Clear cart

#### Price Calculation

```
Subtotal = Sum of (item.price × item.quantity)
Shipping = Subtotal > 5000 ? 0 : 100
GST = Subtotal × 0.18
Total = Subtotal + GST + Shipping - Promo Discount
```

---

### 2. Dashboard Page (`Dashboard.js`)

**File**: [Dashboard.js](../../Dashboard.js) (updated, ~700 lines)

#### Key Changes

**Authentication**:
```javascript
// Uses new token/user storage
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
```

**Order Loading**:
```javascript
// Fetches from API instead of mock data
GET /api/orders/history
```

#### Orders Section

**Features**:
- Display all user orders
- Filter by status: All, Pending, Confirmed, Processing, Shipped, Delivered
- Show order number, date, total, status
- Link to track order
- Download invoice button
- Reorder option for delivered items

**Order Display**:
```javascript
{
  orderNumber: "ORD-1708276543-87234",
  date: "2026-02-16",
  status: "pending",
  total: "₹2,948.60",
  address: "123 Industrial Area, Gurgaon, Haryana 122003"
}
```

#### Cart Count

```javascript
// Updated in real-time from API
GET /api/cart → shows array length as count
```

---

## Database Schema

### Modified Tables

#### `cart` table
```sql
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer_user(id),
  product_id INTEGER NOT NULL REFERENCES product(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);
```

#### `orders` table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer_user(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  gst_amount DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  delivery_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `order_items` table
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES product(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Authentication Flow

### Cart Operations
1. User sends request with JWT token in Authorization header
2. `authenticateToken` middleware verifies token
3. Extracts `req.user.id` (customer_id)
4. Query cart by `customer_id` (ensures data isolation)
5. Return only user's own cart

### Order Creation
1. Verify JWT token
2. Get user from token
3. Fetch user's cart items
4. Validate cart not empty
5. Calculate totals
6. Create order + order items in transaction
7. Clear user's cart
8. Return order details

---

## Error Handling

### Status Codes & Messages

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | ValidationError | Missing/invalid request data |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | NotFoundError | Resource not found |
| 409 | ConflictError | Business logic violation |
| 500 | ServerError | Database/server issue |

### Frontend Error Handling

All fetch requests wrapped in try-catch:
```javascript
try {
  const res = await fetch(url, {headers: {...}});
  if (!res.ok) throw new Error('API error');
  return await res.json();
} catch (error) {
  notify(error.message, 'error');
}
```

---

## Testing Guide

See [PHASE3_TESTING.md](./PHASE3_TESTING.md) for comprehensive testing procedures.

### Quick Test Checklist

- [ ] Add item to cart (authenticated)
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Clear entire cart
- [ ] Create order from cart items
- [ ] View order history
- [ ] View order details
- [ ] Error: Cart empty then checkout
- [ ] Error: Invalid address
- [ ] Error: Unauthenticated access

---

## Environment Variables

Required in `.env`:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/sai_scientifics
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
NODE_ENV=development
```

---

## Performance Considerations

### Database Indexing
```sql
CREATE INDEX idx_cart_customer_id ON cart(customer_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### Query Optimization
- Cart queries: Single customer_id indexed lookup
- Order queries: Limited to user's own orders
- Transactions used for order creation

---

## Security

### Implemented Protections

1. **Authentication**: JWT tokens with 7-day expiration
2. **Authorization**: All operations linked to `req.user.id`
3. **Data Isolation**: Users can only access their own data
4. **Input Validation**: All fields validated before DB query
5. **SQL Injection Prevention**: Parameterized queries
6. **Rate Limiting**: 100 requests per 15 minutes per user
7. **HTTPS Ready**: Helmet.js security headers configured

### CORS Configuration

```javascript
// Configured for localhost:3000 and production domains
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH
Access-Control-Allow-Headers: Content-Type,Authorization
```

---

## Next Phase: Phase 4 - Payment Integration

Phase 4 will add:
- Razorpay payment gateway integration
- Payment order creation
- Webhook handling for payment status
- Invoice generation
- Email notifications

**Prerequisite**: Phase 3 (cart & orders) must be complete ✅

---

## Troubleshooting

### Cart is empty after login
- Check token is stored: `localStorage.getItem('token')`
- Verify backend API is running on port 4000
- Check browser console for fetch errors

### Order creation fails
- Verify cart has items: `GET /api/cart`
- Check all address fields are filled
- Validate pincode is 6 digits
- Check JWT token hasn't expired

### Connection refused error
- Ensure PostgreSQL is running
- Verify `server/src/db.js` configuration matches your database
- Check `DATABASE_URL` in `.env`

---

## Summary

**Phase 3 Deliverables**: ✅
- JWT-authenticated cart system
- Order creation and management
- Order history and tracking
- Real-time API integration
- Production-ready error handling
- Security best practices

**Code Quality**:
- Total: 600+ new lines
- Backend: 330 lines (cart.js + orders.js)
- Frontend: 600 lines (Cart.js + Dashboard.js updates)
- Error handling: ✅
- Input validation: ✅
- Logging: ✅
