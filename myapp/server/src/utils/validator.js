// Input validation utilities
const validator = require('validator');

class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

// Email validation
function validateEmail(email) {
  if (!email || !validator.isEmail(email)) {
    throw new ValidationError('email', 'Valid email is required');
  }
  return email.toLowerCase().trim();
}

// Phone validation (Indian format)
function validatePhone(phone) {
  if (!phone) {
    throw new ValidationError('phone', 'Phone number is required');
  }
  
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check for Indian mobile number (10 digits) or with country code
  if (!/^(\+91)?[6-9]\d{9}$/.test(cleaned)) {
    throw new ValidationError('phone', 'Valid Indian mobile number is required');
  }
  
  return cleaned;
}

// Password validation
function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new ValidationError('password', 'Password must be at least 8 characters long');
  }
  
  // At least one uppercase, one lowercase, one number
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
    throw new ValidationError(
      'password',
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    );
  }
  
  return password;
}

// Name validation
function validateName(name) {
  if (!name || name.trim().length < 2) {
    throw new ValidationError('name', 'Name must be at least 2 characters long');
  }
  
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    throw new ValidationError('name', 'Name can only contain letters and spaces');
  }
  
  return name.trim();
}

// GST number validation
function validateGSTIN(gstin) {
  if (!gstin) return null; // GST is optional
  
  // Remove spaces
  const cleaned = gstin.replace(/\s/g, '').toUpperCase();
  
  // GST format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 alphabet + 1 digit + 1 alphabet
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(cleaned)) {
    throw new ValidationError('gstin', 'Invalid GST number format');
  }
  
  return cleaned;
}

// Amount validation
function validateAmount(amount) {
  const num = Number(amount);
  
  if (isNaN(num) || num <= 0) {
    throw new ValidationError('amount', 'Amount must be a positive number');
  }
  
  return num;
}

// Pincode validation (Indian)
function validatePincode(pincode) {
  if (!pincode) {
    throw new ValidationError('pincode', 'Pincode is required');
  }
  
  const cleaned = pincode.toString().replace(/\s/g, '');
  
  if (!/^\d{6}$/.test(cleaned)) {
    throw new ValidationError('pincode', 'Pincode must be 6 digits');
  }
  
  return cleaned;
}

// Quantity validation
function validateQuantity(quantity) {
  const num = Number(quantity);
  
  if (isNaN(num) || num < 1 || num > 10000) {
    throw new ValidationError('quantity', 'Quantity must be between 1 and 10000');
  }
  
  return Math.floor(num);
}

// Product ID validation
function validateProductId(productId) {
  const num = Number(productId);
  
  if (isNaN(num) || num < 1) {
    throw new ValidationError('productId', 'Invalid product ID');
  }
  
  return num;
}

// Order ID validation
function validateOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    throw new ValidationError('orderId', 'Order ID is required');
  }
  
  if (!/^ORD-\d{4}-[A-Z0-9]+$/.test(orderId)) {
    throw new ValidationError('orderId', 'Invalid order ID format');
  }
  
  return orderId;
}

// Sanitize string input
function sanitizeString(str, maxLength = 1000) {
  if (!str) return '';
  
  return validator.escape(str.toString().trim().substring(0, maxLength));
}

// Validate registration data
function validateRegistration(data) {
  const errors = {};
  
  try {
    data.name = validateName(data.name);
  } catch (e) {
    errors.name = e.message;
  }
  
  try {
    data.email = validateEmail(data.email);
  } catch (e) {
    errors.email = e.message;
  }
  
  try {
    data.password = validatePassword(data.password);
  } catch (e) {
    errors.password = e.message;
  }
  
  try {
    data.phone = validatePhone(data.phone);
  } catch (e) {
    errors.phone = e.message;
  }
  
  if (Object.keys(errors).length > 0) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }
  
  return data;
}

// Validate login data
function validateLogin(data) {
  const errors = {};
  
  try {
    data.email = validateEmail(data.email);
  } catch (e) {
    errors.email = e.message;
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  if (Object.keys(errors).length > 0) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }
  
  return data;
}

module.exports = {
  ValidationError,
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  validateGSTIN,
  validateAmount,
  validatePincode,
  validateQuantity,
  validateProductId,
  validateOrderId,
  sanitizeString,
  validateRegistration,
  validateLogin
};
