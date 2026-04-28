# Backend Plan and API Outline

This project needs a backend service to complete the product. The current UI uses mock data only.

## Core services to implement
- Auth and user profiles
- Product catalog and search
- Cart and checkout
- Orders and tracking
- RFQ (Request for Quote) submissions
- Credit applications
- Reviews
- Support and grievance tickets
- Notifications (email/WhatsApp)

## Minimal API outline (proposal)
- Auth
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/logout

- Products
  - GET /api/products
  - GET /api/products/{id}
  - GET /api/categories

- Cart
  - GET /api/cart
  - POST /api/cart/items
  - PATCH /api/cart/items/{id}
  - DELETE /api/cart/items/{id}

- Orders
  - POST /api/orders
  - GET /api/orders/{id}
  - GET /api/orders/{id}/tracking

- RFQ
  - POST /api/rfq
  - POST /api/rfq/upload

- Credit
  - POST /api/credit-applications

- Reviews
  - POST /api/reviews

- Support
  - POST /api/support/messages
  - POST /api/grievances

## Data model alignment
Use the existing PostgreSQL schema in Database/migrations as the source of truth. Add tables for RFQ, credit applications, reviews, and support tickets as needed.

## File uploads
Use multipart upload endpoints for:
- RFQ attachments
- Grievance attachments
- Review photos

## Payments
- Integrate a payment gateway (Razorpay, Stripe, or similar).
- Create webhook handlers to update payment status in the database.

## Security
- Use proper password hashing (argon2 or bcrypt).
- Add rate limiting and request validation.
- Enforce RLS policies for customer data.
