// Authentication and Security Middleware
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    logger.warn('Authentication attempt without token', { ip: req.ip });
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    logger.debug('Token verified', { userId: decoded.id });
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', { error: error.message, ip: req.ip });
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Optional authentication (doesn't fail if no token)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional auth failed', { error: error.message });
    }
  }
  
  next();
}

// Admin role check
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    logger.warn('Unauthorized admin access attempt', { userId: req.user.id, ip: req.ip });
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}

// Rate limiting by user
const userRequestCounts = new Map();

function rateLimitByUser(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    if (!req.user) return next();
    
    const userId = req.user.id;
    const now = Date.now();
    
    if (!userRequestCounts.has(userId)) {
      userRequestCounts.set(userId, []);
    }
    
    const requests = userRequestCounts.get(userId);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', { userId, ip: req.ip });
      return res.status(429).json({ 
        error: 'Too many requests, please try again later' 
      });
    }
    
    validRequests.push(now);
    userRequestCounts.set(userId, validRequests);
    
    next();
  };
}

// CORS configuration
function configureCORS() {
  return (req, res, next) => {
    const allowedOrigins = process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:3000'];
    
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  };
}

// Request logging middleware
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request
  logger.logRequest(req);
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logResponse(req, res, duration);
  });
  
  next();
}

// Security headers middleware
function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  
  next();
}

// Validate request body size
function validateBodySize(maxSize = 2 * 1024 * 1024) {
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      logger.warn('Request body too large', { size: contentLength, ip: req.ip });
      return res.status(413).json({ error: 'Request body too large' });
    }
    
    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  rateLimitByUser,
  configureCORS,
  requestLogger,
  securityHeaders,
  validateBodySize
};
