# API Documentation

Complete REST API reference for Sai Scientifics backend.

## 📋 Table of Contents
- [Authentication](#authentication)
- [Products](#products)
- [Cart](#cart)
- [Orders](#orders)
- [Payments](#payments)
- [RFQ](#rfq-request-for-quote)
- [Support](#support)
- [Grievances](#grievances)
- [User Profile](#user-profile)

---

## 🔐 Authentication

### Register
Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "phone": "+91 9876543210"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+91 9876543210",
    "created_at": "2026-02-27T10:00:00Z"
  }
}
```

**Errors**:
- `400` - Email already exists or invalid input
- `422` - Validation error

---

### Login
Authenticate user and get JWT token.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Headers** (for all subsequent requests):
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Errors**:
- `401` - Invalid credentials
- `404` - User not found

---

### Logout
Invalidate user session.

**Endpoint**: `POST /auth/logout`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 📦 Products

### List Products
Get paginated list of products.

**Endpoint**: `GET /products`

**Query Parameters**:
```
?limit=10&offset=0&status=active&sort=created_at
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sku": "PROD-001",
      "name": "Industrial Pump",
      "description": "High-performance water pump",
      "base_price": "5000.00",
      "currency": "INR",
      "status": "active",
      "images": [
        {
          "id": "uuid",
          "url": "https://...",
          "alt_text": "Product image"
        }
      ],
      "variants": [
        {
          "id": "uuid",
          "sku": "PROD-001-V1",
          "name": "25MM",
          "stock_quantity": 50
        }
      ],
      "created_at": "2026-02-27T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

**Errors**:
- `400` - Invalid query parameters

---

### Get Product Details
Get detailed information about a specific product.

**Endpoint**: `GET /products/:id`

**Path Parameters**:
```
:id - Product UUID
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "sku": "PROD-001",
    "name": "Industrial Pump",
    "description": "High-performance water pump",
    "base_price": "5000.00",
    "currency": "INR",
    "status": "active",
    "stock_quantity": 150,
    "images": [...],
    "variants": [...],
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Excellent product!",
        "user_name": "John Doe",
        "created_at": "2026-02-27T10:00:00Z"
      }
    ]
  }
}
```

**Errors**:
- `404` - Product not found

---

### Search Products
Search products by name or description.

**Endpoint**: `GET /products/search`

**Query Parameters**:
```
?q=pump&limit=10
```

**Response** (200 OK):
```json
{
  "success": true,
  "query": "pump",
  "results": [
    {
      "id": "uuid",
      "sku": "PROD-001",
      "name": "Industrial Pump",
      "base_price": "5000.00"
    }
  ],
  "total_matches": 5
}
```

---

## 🛒 Cart

### Get Cart
Retrieve user's shopping cart.

**Endpoint**: `GET /cart`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "uuid",
    "items": [
      {
        "id": "cart-item-uuid",
        "product_id": "product-uuid",
        "product_name": "Industrial Pump",
        "quantity": 2,
        "unit_price": "5000.00",
        "subtotal": "10000.00"
      }
    ],
    "total_items": 2,
    "cart_total": "10000.00",
    "updated_at": "2026-02-27T10:00:00Z"
  }
}
```

**Errors**:
- `401` - Unauthorized

---

### Add Item to Cart
Add product to cart.

**Endpoint**: `POST /cart/items`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 2,
  "variant_id": "optional-variant-uuid"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": "cart-item-uuid",
    "product_id": "product-uuid",
    "quantity": 2,
    "subtotal": "10000.00"
  }
}
```

**Errors**:
- `400` - Invalid quantity or product
- `404` - Product not found
- `409` - Out of stock

---

### Update Cart Item
Modify quantity of item in cart.

**Endpoint**: `PUT /cart/items/:id`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "quantity": 5
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "cart-item-uuid",
    "quantity": 5,
    "subtotal": "25000.00"
  }
}
```

---

### Remove Item from Cart
Delete item from cart.

**Endpoint**: `DELETE /cart/items/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### Clear Cart
Remove all items from cart.

**Endpoint**: `DELETE /cart`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## 📋 Orders

### Create Order
Convert cart to order.

**Endpoint**: `POST /orders`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "shipping_address_id": "address-uuid",
  "payment_method": "razorpay",
  "notes": "Urgent delivery",
  "items": [
    {
      "product_id": "product-uuid",
      "quantity": 2,
      "unit_price": "5000.00"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid",
    "order_number": "ORD-2026-0001",
    "status": "pending",
    "total": "10000.00",
    "items_count": 2,
    "created_at": "2026-02-27T10:00:00Z"
  }
}
```

---

### Get Orders
List user's orders.

**Endpoint**: `GET /orders`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
?status=pending&limit=10&offset=0
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "order_number": "ORD-2026-0001",
      "status": "shipped",
      "total": "10000.00",
      "items_count": 2,
      "created_at": "2026-02-27T10:00:00Z",
      "updated_at": "2026-02-27T15:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "has_more": false
  }
}
```

---

### Get Order Details
Get specific order information.

**Endpoint**: `GET /orders/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "order_number": "ORD-2026-0001",
    "status": "shipped",
    "total": "10000.00",
    "items": [
      {
        "product_id": "product-uuid",
        "product_name": "Industrial Pump",
        "quantity": 2,
        "unit_price": "5000.00",
        "subtotal": "10000.00"
      }
    ],
    "shipping_address": {
      "line1": "123 Industrial Park",
      "city": "Mumbai",
      "postal_code": "400001"
    },
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2026-02-27T10:00:00Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2026-02-27T10:05:00Z"
      },
      {
        "status": "shipped",
        "timestamp": "2026-02-27T15:00:00Z"
      }
    ]
  }
}
```

---

### Track Order
Get order tracking information.

**Endpoint**: `GET /orders/:id/track`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "order_number": "ORD-2026-0001",
    "current_status": "shipped",
    "tracking_number": "TRK-12345678",
    "carrier": "Courier Service",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2026-02-27T10:00:00Z",
        "description": "Order created"
      },
      {
        "status": "confirmed",
        "timestamp": "2026-02-27T10:05:00Z",
        "description": "Payment confirmed"
      },
      {
        "status": "packed",
        "timestamp": "2026-02-27T12:00:00Z",
        "description": "Order packed and ready"
      },
      {
        "status": "shipped",
        "timestamp": "2026-02-27T15:00:00Z",
        "description": "Order dispatched"
      }
    ],
    "estimated_delivery": "2026-03-01T18:00:00Z"
  }
}
```

---

## 💳 Payments

### Create Payment
Initiate payment using Razorpay.

**Endpoint**: `POST /payments`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "order_id": "order-uuid",
  "amount": "10000.00",
  "currency": "INR",
  "payment_method": "razorpay"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid",
    "razorpay_order_id": "order_XXX",
    "amount": "10000.00",
    "currency": "INR",
    "status": "pending",
    "created_at": "2026-02-27T10:00:00Z"
  }
}
```

---

### Verify Payment
Verify Razorpay payment signature.

**Endpoint**: `POST /payments/verify`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "razorpay_order_id": "order_XXX",
  "razorpay_payment_id": "pay_XXX",
  "razorpay_signature": "signature_XXX"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "id": "payment-uuid",
    "status": "completed",
    "verified_at": "2026-02-27T10:00:00Z"
  }
}
```

**Errors**:
- `400` - Invalid signature
- `402` - Payment failed

---

## 💬 RFQ (Request for Quote)

### Submit RFQ
Submit a request for quote for custom products.

**Endpoint**: `POST /rfq`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Bulk Pump Order",
  "description": "Need 100 units of industrial pumps",
  "quantity": 100,
  "delivery_timeline": "30 days",
  "file_url": "optional-url-to-specification.pdf"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "RFQ submitted successfully",
  "data": {
    "id": "rfq-uuid",
    "rfq_number": "RFQ-2026-0001",
    "status": "pending",
    "created_at": "2026-02-27T10:00:00Z"
  }
}
```

---

### Get RFQs
List user's RFQs.

**Endpoint**: `GET /rfq`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "rfq-uuid",
      "rfq_number": "RFQ-2026-0001",
      "title": "Bulk Pump Order",
      "status": "quoted",
      "quote_price": "450000.00",
      "created_at": "2026-02-27T10:00:00Z"
    }
  ]
}
```

---

## 🎫 Support

### Create Support Ticket
Submit a support ticket.

**Endpoint**: `POST /support/tickets`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "subject": "Order delivery issue",
  "category": "delivery",
  "description": "Package not delivered yet",
  "priority": "high",
  "order_id": "optional-order-uuid"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "ticket-uuid",
    "ticket_number": "TKT-2026-0001",
    "status": "open",
    "created_at": "2026-02-27T10:00:00Z"
  }
}
```

---

### Get Tickets
List user's support tickets.

**Endpoint**: `GET /support/tickets`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "ticket-uuid",
      "ticket_number": "TKT-2026-0001",
      "subject": "Order delivery issue",
      "status": "open",
      "created_at": "2026-02-27T10:00:00Z"
    }
  ]
}
```

---

## 💔 Grievances

### Submit Grievance
Submit a grievance to management.

**Endpoint**: `POST /grievances`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "subject": "Service quality concern",
  "description": "Detailed description of the issue",
  "grievance_type": "service_quality"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "grievance-uuid",
    "grievance_number": "GRV-2026-0001",
    "status": "received",
    "created_at": "2026-02-27T10:00:00Z"
  }
}
```

---

## 👤 User Profile

### Get Profile
Retrieve user profile information.

**Endpoint**: `GET /user/profile`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+91 9876543210",
    "status": "active",
    "created_at": "2026-02-27T10:00:00Z",
    "updated_at": "2026-02-27T10:00:00Z"
  }
}
```

---

### Update Profile
Update user profile information.

**Endpoint**: `PUT /user/profile`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "full_name": "John Doe Updated",
  "phone": "+91 9876543211"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user-uuid",
    "full_name": "John Doe Updated",
    "phone": "+91 9876543211",
    "updated_at": "2026-02-27T10:00:00Z"
  }
}
```

---

### Get Addresses
List user's addresses.

**Endpoint**: `GET /user/addresses`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "address-uuid",
      "label": "Office",
      "line1": "123 Industrial Park",
      "line2": "Building A",
      "city": "Mumbai",
      "region": "Maharashtra",
      "postal_code": "400001",
      "country_code": "IN"
    }
  ]
}
```

---

### Add Address
Add new address.

**Endpoint**: `POST /user/addresses`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "label": "Home",
  "line1": "456 Residential Area",
  "city": "Bangalore",
  "postal_code": "560001",
  "country_code": "IN"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "address-uuid",
    "label": "Home",
    "line1": "456 Residential Area",
    "city": "Bangalore",
    "postal_code": "560001"
  }
}
```

---

## 🔄 Global Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "optional message",
  "data": {},
  "error": null,
  "timestamp": "2026-02-27T10:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  },
  "timestamp": "2026-02-27T10:00:00Z"
}
```

---

## 🔐 Authentication Header

Include this header with every authenticated request:

```
Authorization: Bearer <jwt_token>
```

**Example**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ❌ HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- All prices are in specified currency (usually INR)
- IDs are UUID v4 format
- Pagination limit max is 100
- Rate limit: 1000 requests per hour

---

**API Version**: 1.0  
**Last Updated**: February 27, 2026
