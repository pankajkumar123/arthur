# Project Structure - Industry Standards

## 📁 Project Organization

```
SS/
├── .github/
│   └── workflows/              # CI/CD pipelines
│       ├── backend.yml         # Backend: test, lint, deploy
│       └── frontend.yml        # Frontend: test, lint, build, deploy
│
├── myapp/                       # Frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components (routes)
│   │   ├── services/           # API calls and business logic
│   │   ├── context/            # React Context for state
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript/JSDoc type definitions
│   │   ├── constants/          # UI constants and API endpoints
│   │   ├── lib/                # Utility functions
│   │   ├── assets/             # Images, fonts, icons
│   │   ├── App.jsx             # Root component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite config
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── eslint.config.js        # ESLint rules
│
├── myapp/server/               # Backend (Node.js)
│   ├── src/
│   │   ├── controllers/        # Business logic & request handlers
│   │   ├── routes/             # API endpoint definitions
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Data models & schemas
│   │   ├── validators/         # Input validation
│   │   ├── config/             # Configuration files
│   │   │   ├── server.js       # Server config
│   │   │   ├── database.js     # Database config
│   │   │   └── index.js        # Config exports
│   │   ├── constants/          # Error codes, messages, etc
│   │   ├── utils/              # Utility functions
│   │   ├── db.js               # Database connection
│   │   └── index.js            # Entry point
│   ├── tests/                  # Test files
│   │   ├── unit/               # Unit tests
│   │   ├── integration/        # Integration tests
│   │   └── e2e/                # End-to-end tests
│   ├── scripts/                # Database migration scripts
│   ├── package.json            # Backend dependencies
│   ├── .env.local              # Local environment variables
│   └── .env.example            # Environment template
│
├── .github/                    # GitHub configuration
├── .prettierrc                 # Code formatting rules
├── .prettierignore             # Files to skip formatting
├── package.json                # Root package (monorepo)
├── README.md                   # Project documentation
└── ARCHITECTURE.md             # This file
```

---

## 🏗️ Architecture Layers

### Frontend (React + Vite)
```
UI Layer
    ↓
Pages (routes)
    ↓
Components (reusable UI)
    ↓
Custom Hooks
    ↓
Services (API calls)
    ↓
Context (state management)
```

### Backend (Express.js)
```
Routes (HTTP endpoints)
    ↓
Controllers (business logic)
    ↓
Validators (input validation)
    ↓
Models (data schemas)
    ↓
Database
```

---

## 📋 File Naming Conventions

### Frontend
- **Components**: `PascalCase.jsx` (e.g., `ProductCard.jsx`)
- **Hooks**: `camelCase.js` (e.g., `useAuth.js`)
- **Services**: `camelCase.js` (e.g., `authService.js`)
- **Utilities**: `camelCase.js` (e.g., `formatDate.js`)
- **Types**: `camelCase.js` (e.g., `user.js`)

### Backend
- **Controllers**: `camelCase.js` (e.g., `productController.js`)
- **Routes**: `camelCase.js` (e.g., `productRoutes.js`)
- **Models**: `PascalCase.js` (e.g., `Product.js`)
- **Middleware**: `camelCase.js` (e.g., `authMiddleware.js`)
- **Utils**: `camelCase.js` (e.g., `logger.js`)

---

## 🔄 Request/Response Flow

### Incoming Request
```
HTTP Request
    ↓
Router (matches endpoint)
    ↓
Middleware (auth, validation)
    ↓
Validator (input validation)
    ↓
Controller (business logic)
    ↓
Model (database query)
    ↓
Response
```

### Example: Get Products
```
GET /api/products?limit=10
    ↓
ProductRoutes
    ↓
ProductController.getProducts()
    ↓
Database.query('SELECT * FROM products...')
    ↓
Response: { success: true, data: [...] }
```

---

## 🧪 Testing Strategy

### Backend Tests
- **Unit Tests**: Test utilities, validators in isolation
- **Integration Tests**: Test API endpoints with database
- **E2E Tests**: Test full user workflows

Run: `npm test` (in server directory)

### Frontend Tests
- **Component Tests**: Test React components
- **Integration Tests**: Test multiple components together
- **E2E Tests**: Test user interactions

Run: `npm test` (in frontend directory)

---

## 🚀 Deployment Pipeline

```
1. Developer pushes code to GitHub
        ↓
2. GitHub Actions CI/CD triggers
        ↓
3. Lint & Format Check ✅
        ↓
4. Run Tests ✅
        ↓
5. Build & Package ✅
        ↓
6. Deploy to Render (backend) or Netlify (frontend)
        ↓
7. Smoke Tests ✅
        ↓
8. Live on Production
```

---

## 📚 Configuration Files

- `.env.local`: Local environment variables (never commit)
- `.env.example`: Template for environment variables
- `.prettierrc`: Code formatting rules
- `eslint.config.js`: Code quality rules
- `vite.config.js`: Frontend build configuration
- `package.json`: Dependencies and scripts

---

## ✅ Standards Compliance

This structure follows:
- ✅ Node.js best practices (structure, naming)
- ✅ React best practices (components, hooks)
- ✅ Express.js conventions (routes, middleware)
- ✅ SOLID principles (single responsibility)
- ✅ DRY (Don't Repeat Yourself)
- ✅ Industry-standard folder organization

---

## 🔗 References

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Best Practices](https://react.dev/learn)
- [Node.js Project Structure](https://github.com/goldbergyoni/nodebestpractices)
- [Npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
