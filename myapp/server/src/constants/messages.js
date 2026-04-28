/**
 * Application Messages
 * Centralized success and error messages
 */

const MESSAGES = {
  // Auth messages
  AUTH: {
    LOGIN_SUCCESS: 'User logged in successfully',
    SIGNUP_SUCCESS: 'User registered successfully',
    LOGOUT_SUCCESS: 'User logged out successfully',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_REGISTERED: 'Email already registered'
  },
  
  // Product messages
  PRODUCT: {
    FETCHED: 'Products fetched successfully',
    NOT_FOUND: 'Product not found',
    CREATED: 'Product created successfully',
    UPDATED: 'Product updated successfully',
    DELETED: 'Product deleted successfully'
  },
  
  // Order messages
  ORDER: {
    CREATED: 'Order created successfully',
    FETCHED: 'Order fetched successfully',
    UPDATED: 'Order updated successfully',
    CANCELLED: 'Order cancelled successfully',
    NOT_FOUND: 'Order not found'
  },
  
  // Cart messages
  CART: {
    ITEM_ADDED: 'Item added to cart',
    ITEM_REMOVED: 'Item removed from cart',
    ITEM_UPDATED: 'Item updated in cart',
    CART_CLEARED: 'Cart cleared successfully',
    CART_FETCHED: 'Cart fetched successfully'
  },
  
  // Payment messages
  PAYMENT: {
    SUCCESS: 'Payment successful',
    FAILED: 'Payment failed',
    PENDING: 'Payment pending'
  },
  
  // Database messages
  DATABASE: {
    ERROR: 'Database error occurred',
    CONNECTION_ERROR: 'Database connection error',
    QUERY_ERROR: 'Database query error'
  },
  
  // Server messages
  SERVER: {
    STARTED: 'Server started successfully',
    SHUTDOWN: 'Server shutting down',
    ERROR: 'Server error occurred'
  }
};

module.exports = MESSAGES;
