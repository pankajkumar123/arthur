# Authentication System - Quick Reference

## Routes

| Route | Type | Component | Description |
|-------|------|-----------|-------------|
| `/login` | Public | LoginPage | User login |
| `/register` | Public | RegisterPage | User registration |
| `/` | Protected | Home | Dashboard (requires auth) |

## Components

### FormInput
Reusable input component with error handling and password visibility toggle.

```jsx
<FormInput
  label="Email"
  name="email"
  type="email"
  value={formData.email}
  onChange={handleChange}
  error={errors.email}
  placeholder="user@example.com"
  required
/>
```

### LoginForm
Login form with email and password validation.

```jsx
<LoginForm />
```

### RegisterForm
Registration form with comprehensive validation and password strength indicator.

```jsx
<RegisterForm />
```

### ProtectedRoute
Wraps routes that require authentication. Redirects to /login if not authenticated.

```jsx
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

### Navbar
Navigation bar with user profile and logout functionality.

```jsx
<Navbar />
```

## Context Hooks

### useAuth()
Get current authentication state and methods.

```jsx
const { user, isAuthenticated, loading, login, register, logout } = useAuth();
```

**Properties:**
- `user`: Current user object `{ id, fullName, email, phone }`
- `isAuthenticated`: Boolean indicating logged-in status
- `loading`: Boolean indicating loading state
- `login(credentials)`: Login with email/password
- `register(userData)`: Register new account
- `logout()`: Clear session and logout

## Validation Utilities

All validation functions are in `src/utils/validation.js`:

```javascript
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePhone,
  validatePasswordConfirmation,
  validateLoginForm,
  validateRegistrationForm
} from '../utils/validation';
```

## API Endpoints

### POST /api/auth/register
```javascript
const result = await api.register({
  fullName: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  password: "SecurePass123!"
});
```

### POST /api/auth/login
```javascript
const result = await api.login({
  email: "john@example.com",
  password: "SecurePass123!"
});
```

### GET /api/user/profile
```javascript
const profile = await api.getProfile();
```

## Error Handling

### Form Validation Errors
- Field-specific error messages display on blur
- Real-time clearing when user types
- Submit button disabled if validation fails

### Server Errors
- Network errors → "Network error. Please check your connection."
- 401 → Redirect to login (auto-handled)
- 403 → "Forbidden"
- 404 → "Not found"
- 5xx → "Server error"

## Local Development

```bash
# Install dependencies
npm install react-router-dom

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Password Requirements

- ✓ Minimum 8 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one number (0-9)
- ✓ At least one special character (!@#$%^&*...)

Example: `SecurePass123!`

## Data Persistence

- JWT token stored in `localStorage.authToken`
- Auto-cleared on logout or 401 response
- Persists across page refreshes
- Auto-loads user profile on app mount

## Common Tasks

### Check if user is logged in
```jsx
const { isAuthenticated } = useAuth();
if (isAuthenticated) {
  // Show logged-in content
}
```

### Get current user
```jsx
const { user } = useAuth();
console.log(user.fullName); // "John Doe"
```

### Logout user
```jsx
const { logout } = useAuth();
await logout();
// User redirects to login
```

### Protect a route
```jsx
<Route
  path="/dashboard"
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
/>
```

### Handle login errors
```jsx
const { login } = useAuth();
const result = await login({ email, password });
if (!result.success) {
  console.error(result.error);
}
```

## File Structure

```
src/
├── components/
│   ├── FormInput.jsx          # Reusable input
│   ├── LoginForm.jsx          # Login form
│   ├── RegisterForm.jsx       # Registration form
│   ├── ProtectedRoute.jsx     # Route protection
│   ├── Navbar.jsx             # Navigation
│   └── ui/
│       └── Button.jsx
├── pages/
│   ├── Home.jsx               # Dashboard (protected)
│   ├── Login.jsx              # Login page
│   └── Register.jsx           # Registration page
├── context/
│   └── AuthContext.jsx        # Auth state
├── services/
│   └── api.js                 # API client
├── utils/
│   └── validation.js          # Form validation
└── App.jsx                    # Router setup
```

## Browser DevTools

### Check localStorage
```javascript
// View auth token
console.log(localStorage.getItem('authToken'));

// Clear auth (for testing)
localStorage.removeItem('authToken');
```

### Inspect network requests
1. Open DevTools Network tab
2. Try login/register
3. Check POST /auth/login request
4. View response headers for token

## Deployment

### Environment Variables
Update `VITE_API_URL` in deployment settings:

**Netlify:**
- Site settings → Build & deploy → Environment
- Add: `VITE_API_URL=https://your-backend-url.onrender.com`

### Production Checklist
- [ ] Update VITE_API_URL to production backend
- [ ] Enable HTTPS for all connections
- [ ] Test login/register flow
- [ ] Verify token persistence
- [ ] Test logout functionality
- [ ] Check error messages

## Troubleshooting

### "Email already registered"
- Use different email or reset password

### Build fails with routing error
- Verify `react-router-dom` is installed
- Check import statements

### Auth token not saving
- Check browser storage enabled
- Check localStorage in DevTools
- Verify API returns token

### Pages not showing
- Verify routes in App.jsx
- Check component imports
- Run `npm run build` for errors

## Next Steps

1. Add password reset functionality
2. Implement email verification
3. Add remember me feature
4. Implement social login
5. Add 2-factor authentication
