# Authentication System Documentation

## Overview

This authentication system provides secure login and registration functionality with Supabase integration. It follows industry standards with proper form validation, error handling, and protected routes.

## Features

✅ **User Registration** - Create new accounts with email, password, and optional phone
✅ **User Login** - Authenticate with email and password
✅ **Password Validation** - Strong password requirements enforcement
✅ **Form Validation** - Real-time client-side validation with error feedback
✅ **Protected Routes** - Secure pages that require authentication
✅ **JWT Token Management** - Secure token storage and request handling
✅ **Error Handling** - Comprehensive error messages for users
✅ **Tailwind CSS** - Modern, responsive UI design

## Architecture

### Components

```
src/components/
├── FormInput.jsx          # Reusable input component with validation feedback
├── LoginForm.jsx          # Login form with email and password fields
├── RegisterForm.jsx       # Registration form with validation
└── ProtectedRoute.jsx     # Route wrapper for authentication-required pages
```

### Pages

```
src/pages/
├── Home.jsx              # Home page (protected)
├── Login.jsx             # Login page
└── Register.jsx          # Registration page
```

### Context & Services

```
src/context/
└── AuthContext.jsx       # Authentication state management

src/services/
└── api.js               # API client with auth endpoints

src/utils/
└── validation.js        # Form validation utilities
```

## Password Requirements

Passwords must meet the following criteria:
- **Minimum 8 characters** long
- **At least one uppercase letter** (A-Z)
- **At least one number** (0-9)
- **At least one special character** (!@#$%^&*...)

Example valid password: `SecurePass123!`

## Form Validation

### Login Form
- Email: Valid email format required
- Password: At least 8 characters

### Registration Form
- Full Name: 2-100 characters required
- Email: Valid email format required
- Phone: 10-digit number (optional)
- Password: Must meet strong password requirements
- Confirm Password: Must match password field

### Real-time Validation
- Errors appear when user leaves field (blur event)
- Error messages clear when user starts typing
- Submit button disabled if validation fails

## API Integration

### Endpoints Used

**POST /api/auth/register**
Register a new user account

Request:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass123!"
}
```

Response (201 Created):
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

**POST /api/auth/login**
Login with email and password

Request:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response (200 OK):
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

## Usage

### Using Authentication Context

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, register, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.fullName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please login first</p>
      )}
    </div>
  );
}
```

### Protecting Routes

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Form Validation

```jsx
import { validateRegistrationForm } from '../utils/validation';

const validation = validateRegistrationForm(formData);
if (!validation.isValid) {
  // validation.errors contains field-level errors
}
```

## Database Schema

### customer_user table

```sql
CREATE TABLE customer_user (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

✅ **Password Hashing** - bcryptjs with salt rounds
✅ **JWT Tokens** - Secure token-based authentication
✅ **HTTPS Only** - Uses secure connections in production
✅ **Token Storage** - Stored in localStorage for persistence
✅ **Auto Logout** - 401 errors clear token and redirect to login
✅ **XSS Protection** - Input sanitization on backend
✅ **CORS Protection** - Configured for allowed origins

## Error Handling

### Common Errors

**Email already registered**
- User tries to register with existing email
- Message: "Email already registered"

**Invalid credentials**
- Wrong email or password on login
- Message: "Invalid email or password"

**Validation failed**
- Form fields don't meet requirements
- Shows field-specific error messages

**Network error**
- Server unreachable
- Message: "Network error. Please check your connection."

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

✅ Semantic HTML elements
✅ ARIA labels for form inputs
✅ Keyboard navigation support
✅ High contrast error messages
✅ Screen reader friendly

## Testing

### Manual Testing Checklist

- [ ] Register with valid data → creates account and logs in
- [ ] Register with invalid email → shows error
- [ ] Register with weak password → shows requirements
- [ ] Register with existing email → shows conflict error
- [ ] Login with correct credentials → succeeds
- [ ] Login with wrong password → shows error
- [ ] Login with non-existent email → shows error
- [ ] Protected route access without login → redirects to /login
- [ ] Session persistence → token saved in localStorage
- [ ] Logout → clears token and redirects

### Unit Tests

Run tests with:
```bash
npm test
```

### Integration Tests

Test full authentication flow:
1. Register new user
2. Logout
3. Login with new credentials
4. Access protected route
5. Logout

## Performance Optimization

- Form validation debouncing to reduce re-renders
- Lazy loading of authentication pages
- Minimal dependencies (axios, react-router-dom)
- Optimized bundle size

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Remember me functionality
- [ ] Account recovery options
- [ ] Login history/activity

## Troubleshooting

### "Network error" on login
- Check API_BASE_URL in environment variables
- Verify backend server is running
- Check CORS configuration

### "Email already registered"
- Use different email for registration
- Use forgot password to recover account
- Contact support if needed

### Form validation not working
- Check browser console for errors
- Verify input field names match validation rules
- Clear browser cache

### Token not persisting
- Check localStorage is enabled in browser
- Verify authToken is saved after login
- Check browser storage limits

## Support & Maintenance

For issues or questions:
1. Check error messages in browser console
2. Review validation error details
3. Contact development team
4. Check GitHub issues: https://github.com/umeshchandracholleti/SS

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall project structure
- [STANDARDS_CHECKLIST.md](../STANDARDS_CHECKLIST.md) - Industry standards compliance
- [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - Backend API details
