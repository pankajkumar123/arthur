# Sai Scientifics - Backend API

RESTful API server for the Sai Scientifics e-commerce platform built with Node.js, Express, and Supabase PostgreSQL.

## 🚀 Tech Stack

- **Node.js + Express** - REST API framework
- **Supabase PostgreSQL** - Cloud database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Razorpay** - Payment processing
- **Nodemailer** - Email notifications
- **Twilio** - SMS/WhatsApp messaging

## 📁 Project Structure

```
server/
├── src/
│   ├── routes/          # API endpoint routes
│   │   ├── auth.js
│   │   ├── catalog.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── payment.js
│   │   ├── support.js
│   │   └── ...
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.js
│   │   ├── auth.js
│   │   └── validation.js
│   ├── utils/           # Helper functions
│   │   └── logger.js
│   ├── db.js            # Database connection
│   └── index.js         # Server entry point
├── scripts/
│   ├── migrate.js       # Database migrations
│   ├── seed.js          # Seed test data
│   └── ...
├── tests/               # Jest test suite
├── .env.local           # Environment config
├── .env.example         # Template
└── package.json
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <backend-repo-url>
   cd SS-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   
   JWT_SECRET=your-very-long-random-secret-min-32-chars
   JWT_EXPIRES_IN=7d
   
   PORT=4000
   NODE_ENV=development
   ```

4. **Run migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:4000

## 📜 Available Scripts

```bash
npm run dev              # Start with --watch mode
npm start               # Start production server
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed with test data
npm run test            # Run Jest tests
npm run lint            # Run ESLint
npm run test:e2e        # End-to-end tests
```

## 🗄️ Database

### Supabase PostgreSQL

The backend uses Supabase PostgreSQL with 12 tables:

- `app_user` - User accounts
- `user_address` - Addresses
- `product` - Product catalog
- `product_variant` - Variations
- `product_image` - Images
- `customer_order` - Orders
- `order_item` - Order items
- `payment` - Transactions
- `payment_event` - Payment history
- `inventory` - Stock levels
- `warehouse` - Locations
- `inventory_reservation` - Reservations

### Test Connection

```bash
node test-supabase.js
```

Should output:
```
✓ Database connected successfully
✅ Health check: { healthy: true, ... }
✅ Database has 12 tables
🎉 Supabase connection successful!
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Products
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `GET /products/search?q=query` - Search products

### Cart
- `GET /cart` - Get user cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:id` - Update item quantity
- `DELETE /cart/items/:id` - Remove item

### Orders
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `GET /orders/:id/track` - Track order

### Payments
- `POST /payments` - Create payment
- `POST /payments/verify` - Verify payment

### RFQ (Request for Quote)
- `POST /rfq` - Submit RFQ
- `GET /rfq` - Get user RFQs

### Support
- `POST /support/tickets` - Create support ticket
- `GET /support/tickets` - Get user tickets

### More endpoints in routes/

## 🔐 Authentication

JWT-based authentication:

1. **Login/Register**: Get JWT token
2. **Store token**: Save in localStorage (frontend)
3. **Send token**: Include in Authorization header
4. **Verify token**: Backend middleware validates

```javascript
// Example request with JWT
axios.get('/api/orders', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 🚢 Deployment

### To Render

1. **Create GitHub repository**: `SS-Backend`
2. **Push code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Deploy**:
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repo
   - Set start command: `npm start`
   - Add environment variables from `.env.local`
   - Deploy

### Environment Variables (Render)
Set these in Render dashboard:
```
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=production
```

## 🔧 Troubleshooting

### Database Connection Failed
```bash
# Check environment
echo $DATABASE_URL

# Test connection
node test-supabase.js

# Verify Supabase project is active
```

### Port Already in Use
```bash
# Change PORT in .env.local
PORT=4001

# Or kill process on port 4000 (Windows)
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📖 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [JWT Documentation](https://jwt.io/introduction)
- [Razorpay API](https://razorpay.com/docs/api/)

## 📞 Support

For issues:
- Check logs: `npm run dev`
- Test database: `node test-supabase.js`
- Check environment variables
- Review error messages carefully

## 📄 License

MIT

---

**API for Sai Scientifics E-commerce Platform**
