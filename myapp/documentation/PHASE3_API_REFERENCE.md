# Phase 3: API Quick Reference

**Last Updated**: February 16, 2026

---

## Base URL
```
http://localhost:4000/api
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

Token obtained from login:
```javascript
const token = localStorage.getItem('token');
```

---

## Cart Endpoints

### GET /cart
Get user's cart items

**Response** (200):
```json
[
  {
    "id": 1,
    "product_id": 5,
    "name": "Product Name",
    "price": "1200.00",
    "quantity": 2,
    "image_url": "https://..."
  }
]
```

**Usage** (JavaScript):
```javascript
const cart = await fetch('/api/cart', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

### POST /cart/add
Add product to cart

**Request**:
```json
{
  "productId": 5,
  "quantity": 1
}
```

**Response** (201):
```json
{
  "cartItemId": 1,
  "message": "Added to cart"
}
```

**Usage**:
```javascript
const res = await fetch('/api/cart/add', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productId: 5,
    quantity: 1
  })
}).then(r => r.json());
```

---

### PUT /cart/:cartItemId
Update item quantity

**Request**:
```json
{
  "quantity": 5
}
```

**Response** (200):
```json
{
  "message": "Quantity updated"
}
```

**Usage**:
```javascript
await fetch(`/api/cart/${itemId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ quantity: 5 })
});
```

---

### DELETE /cart/:cartItemId
Remove item from cart

**Response** (200):
```json
{
  "message": "Item removed"
}
```

**Usage**:
```javascript
await fetch(`/api/cart/${itemId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### DELETE /cart
Clear entire cart

**Response** (200):
```json
{
  "message": "Cart cleared"
}
```

**Usage**:
```javascript
await fetch('/api/cart', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Order Endpoints

### POST /orders/create
Create order from cart

**Request**:
```json
{
  "addressLine": "123 Industrial Area",
  "city": "Gurgaon",
  "state": "Haryana",
  "pincode": "122003",
  "paymentMethod": "prepaid"
}
```

**Response** (201):
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

**Usage**:
```javascript
const order = await fetch('/api/orders/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    addressLine: "123 Industrial Area",
    city: "Gurgaon",
    state: "Haryana",
    pincode: "122003",
    paymentMethod: "prepaid"
  })
}).then(r => r.json());
```

---

### GET /orders/history
Get all user orders

**Response** (200):
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

**Usage**:
```javascript
const orders = await fetch('/api/orders/history', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

### GET /orders/:orderId
Get order details

**Response** (200):
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
      "product_id": 5,
      "quantity": 2,
      "unit_price": "1200.00",
      "name": "Product Name",
      "image_url": "https://..."
    }
  ]
}
```

**Usage**:
```javascript
const order = await fetch(`/api/orders/${orderId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

### PATCH /orders/:orderId/status
Update order status

**Request**:
```json
{
  "status": "shipped"
}
```

**Valid Statuses**: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

**Response** (200):
```json
{
  "message": "Order status updated",
  "status": "shipped"
}
```

**Usage**:
```javascript
await fetch(`/api/orders/${orderId}/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'shipped' })
});
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "error": "All address and payment fields required",
  "code": "VALIDATION_ERROR"
}
```

### 401 - Unauthorized
```json
{
  "error": "Token required",
  "code": "UNAUTHORIZED"
}
```

### 404 - Not Found
```json
{
  "error": "Product not found",
  "code": "NOT_FOUND"
}
```

### 500 - Server Error
```json
{
  "error": "Internal server error",
  "code": "SERVER_ERROR"
}
```

---

## Helper Function

Use this in your JavaScript code:

```javascript
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`http://localhost:4000/api${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
}

// Usage:
const cart = await apiCall('/cart');
const product = await apiCall('/cart/add', {
  method: 'POST',
  body: JSON.stringify({ productId: 5, quantity: 1 })
});
```

---

## Common Workflows

### Add Item and View Cart
```javascript
// 1. Add item
await apiCall('/cart/add', {
  method: 'POST',
  body: JSON.stringify({ productId: 5, quantity: 1 })
});

// 2. Get updated cart
const cart = await apiCall('/cart');
console.log(cart);
```

### Create and View Order
```javascript
// 1. Create order
const order = await apiCall('/orders/create', {
  method: 'POST',
  body: JSON.stringify({
    addressLine: "123 Main St",
    city: "Gurgaon",
    state: "Haryana",
    pincode: "122003",
    paymentMethod: "prepaid"
  })
});

// 2. Get order details
const details = await apiCall(`/orders/${order.orderId}`);
console.log(details);
```

### View All Orders
```javascript
const all = await apiCall('/orders/history');
all.forEach(order => {
  console.log(`${order.order_number}: ${order.status}`);
});
```

---

## Price Calculation

Order totals are calculated by backend:

```
Subtotal = Σ(item.price × item.quantity)
GST = Subtotal × 0.18
Shipping = Subtotal > 5000 ? 0 : 100
Total = Subtotal + GST + Shipping
```

---

## Testing with curl

### Add to Cart
```bash
curl -X POST http://localhost:4000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 5, "quantity": 1}'
```

### Get Cart
```bash
curl -X GET http://localhost:4000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Order
```bash
curl -X POST http://localhost:4000/api/orders/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressLine": "123 Industrial Area",
    "city": "Gurgaon",
    "state": "Haryana",
    "pincode": "122003",
    "paymentMethod": "prepaid"
  }'
```

### Get Orders
```bash
curl -X GET http://localhost:4000/api/orders/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Environment Setup

Required for all API calls:

```javascript
// 1. Check authentication
if (!localStorage.getItem('token')) {
  window.location.href = 'Login.html';
}

// 2. Set base URL if not localhost:4000
const API_BASE = 'http://localhost:4000/api';

// 3. Check network connectivity
const testAPI = async () => {
  try {
    await fetch(API_BASE, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  } catch (e) {
    console.error('API not reachable');
  }
};
```

---

**Phase 3 API Reference Complete**

For detailed documentation, see [PHASE3_CART_ORDERS.md](./PHASE3_CART_ORDERS.md)
