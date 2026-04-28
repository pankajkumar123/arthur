# Sai Scientifics - Industrial Supplies E-commerce Platform

A modern, full-stack e-commerce platform for industrial supplies built with React, Vite, Tailwind CSS, Node.js, Express, and Supabase PostgreSQL.

## 🚀 Tech Stack

### Frontend
- **React 19.2** - UI framework
- **Vite 7.3** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Re-usable component library
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library

### Backend
- **Node.js + Express** - REST API server
- **Supabase PostgreSQL** - Cloud database (PostgreSQL 17.6)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Razorpay** - Payment gateway integration
- **Nodemailer** - Email notifications
- **Twilio** - SMS/WhatsApp notifications

## 📁 Project Structure

```
myapp/
├── src/                      # React application source
│   ├── components/           # Reusable UI components
│   │   └── ui/              # ShadCN UI components
│   ├── pages/               # Page components
│   ├── services/            # API service layer (Axios)
│   ├── context/             # React Context providers
│   ├── lib/                 # Utility functions
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles + Tailwind
├── server/                  # Backend API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Helper functions
│   │   └── db.js            # Database connection
│   ├── scripts/             # Migration & seed scripts
│   └── .env.local           # Environment variables
├── Database/                # Database schemas
│   └── supabase-schema.sql  # Complete schema
├── public/                  # Static assets
├── index.html               # Vite entry HTML
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── vite.config.js           # Vite configuration
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myapp
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Configure environment variables**
   
   Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Update `server/.env.local` with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   DATABASE_URL=your_supabase_connection_string
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Run database migration**
   ```bash
   cd server
   npm run db:migrate
   ```

### Development

**Start the backend server:**
```bash
cd server
npm run dev
```
API runs on http://localhost:4000

**Start the frontend dev server:**
```bash
npm run dev
```
Frontend runs on http://localhost:5173

### Building for Production

**Build frontend:**
```bash
npm run build
```
Output: `dist/` folder

**Build backend:**
```bash
cd server
npm run build
```

## 🗄️ Database

### Supabase PostgreSQL

The application uses **Supabase** as the cloud PostgreSQL database.

**Database includes 12 tables:**
- `app_user` - User accounts
- `user_address` - User addresses
- `product` - Product catalog
- `product_variant` - Product variations
- `product_image` - Product images
- `customer_order` - Orders
- `order_item` - Order line items
- `payment` - Payment transactions
- `payment_event` - Payment history (JSONB)
- `inventory` - Stock levels
- `warehouse` - Warehouse locations
- `inventory_reservation` - Reserved stock

**Access Supabase Dashboard:**
- Project Dashboard: https://supabase.com/dashboard
- SQL Editor: Run queries and view data
- Table Editor: Visual database management

**Test database connection:**
```bash
cd server
node test-supabase.js
```

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with custom theme configuration.

**Key features:**
- Custom color palette matching brand identity
- Dark mode support
- Responsive design utilities
- ShadCN UI integration

### ShadCN UI Components

Pre-built, accessible components with Tailwind CSS:
- Button, Card, Dialog, Input, etc.
- Customizable with `cn()` utility
- Located in `src/components/ui/`

**Adding new ShadCN components:**
Copy components from [ui.shadcn.com](https://ui.shadcn.com) into `src/components/ui/`

## 🌐 API Integration

### Axios Service Layer

All API calls are centralized in `src/services/api.js`:

```javascript
import { api } from './services/api';

// Example usage
const products = await api.getProducts({ limit: 10 });
const order = await api.createOrder(orderData);
```

**Features:**
- Automatic authentication token injection
- Global error handling
- Request/response interceptors
- Centralized API endpoints

## 🔐 Authentication

JWT-based authentication with React Context:

```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use auth state and methods
}
```

## 📜 Scripts

### Frontend Scripts
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
```

### Backend Scripts
```bash
npm run dev          # Start with --watch mode
npm start            # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
npm test             # Run Jest tests
```

## 🚢 Deployment

### Frontend (Netlify)
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Environment variable: `VITE_API_URL=<your-backend-url>`

### Backend (Render)
1. Build command: `npm install`
2. Start command: `npm start`
3. Add all environment variables from `.env.local`

## 📝 Notes

- Static HTML pages (BuyOnCredit.html, Cart.html, etc.) are legacy pages being migrated to React
- Use `defer` attribute for script loading in static pages
- All modals include ARIA attributes for accessibility
- API defaults to port 4000, frontend to port 5173

## 🔧 Troubleshooting

**Database connection issues:**
```bash
# Test connection
cd server
node test-supabase.js

# Check environment variables
$env:DATABASE_URL
```

**Frontend not connecting to backend:**
- Verify `VITE_API_URL` in `.env`
- Check backend is running on correct port
- Check CORS settings in `server/src/index.js`

**Build errors:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run build -- --force
```

## 📞 Support

For issues or questions:
- Submit a support ticket through the app
- Email: sales@saiscientifics.com
- WhatsApp: +91 9182755368

## 📄 License

MIT

---

**Built with ❤️ for industrial supply professionals**
