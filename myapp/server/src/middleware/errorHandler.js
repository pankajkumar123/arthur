// Centralized Error Handling Middleware
const logger = require('../utils/logger');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = {}) {
    super(message, 400);
    this.errors = errors;
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

// Error response formatter
function formatErrorResponse(error, includeStack = false) {
  const response = {
    error: error.message || 'An error occurred',
    statusCode: error.statusCode || 500
  };
  
  // Include validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }
  
  // Include stack trace in development
  if (includeStack && error.stack) {
    response.stack = error.stack;
  }
  
  return response;
}

// Main error handling middleware
function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous'
  });
  
  // Determine if we should include stack trace
  const includeStack = process.env.NODE_ENV === 'development';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json(formatErrorResponse(err, includeStack));
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      statusCode: 401
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      statusCode: 401
    });
  }
  
  // Database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({
      error: 'Resource already exists',
      statusCode: 409
    });
  }
  
  if (err.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json({
      error: 'Invalid reference',
      statusCode: 400
    });
  }
  
  if (err.code === '23502') { // PostgreSQL not null violation
    return res.status(400).json({
      error: 'Required field missing',
      statusCode: 400
    });
  }
  
  // Operational errors (expected)
  if (err.isOperational) {
    return res.status(err.statusCode).json(formatErrorResponse(err, includeStack));
  }
  
  // Programming or unknown errors (unexpected)
  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    statusCode: 500,
    ...(includeStack && { stack: err.stack })
  });
}

// 404 handler for undefined routes
function notFoundHandler(req, res) {
  logger.warn('Route not found', { 
    url: req.url, 
    method: req.method,
    ip: req.ip 
  });
  
  res.status(404).json({
    error: 'Route not found',
    statusCode: 404,
    path: req.url
  });
}

// Async error wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Process-level error handlers
function handleUncaughtException() {
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
      message: err.message,
      stack: err.stack
    });
    
    process.exit(1);
  });
}

function handleUnhandledRejection() {
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', {
      message: err.message,
      stack: err.stack
    });
    
    process.exit(1);
  });
}

module.exports = {
  // Error classes
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  
  // Middleware
  errorHandler,
  notFoundHandler,
  asyncHandler,
  
  // Process handlers
  handleUncaughtException,
  handleUnhandledRejection
};
