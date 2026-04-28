# Admin Dashboard

## Access
Open admin.html in the browser. Use the seeded admin credentials:

- Email: admin@saiscientifics.com
- Password: Admin@123

## Features
- View RFQ submissions, credit applications, orders, reviews, grievances, and support messages.
- Create products and categories.

## API
Admin endpoints require a Bearer token:
- POST /api/admin/login
- POST /api/admin/logout
- GET /api/admin/rfq
- GET /api/admin/credit
- GET /api/admin/orders
- GET /api/admin/reviews
- GET /api/admin/grievances
- GET /api/admin/support
- GET /api/admin/products
- POST /api/admin/products
- PATCH /api/admin/products/:id
- DELETE /api/admin/products/:id
- GET /api/admin/categories
- POST /api/admin/categories
- PATCH /api/admin/categories/:id
- DELETE /api/admin/categories/:id
