require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

// Import utilities and middleware
const logger = require('./utils/logger');
const db = require('./db');
const { 
  errorHandler, 
  notFoundHandler, 
  handleUncaughtException, 
  handleUnhandledRejection 
} = require('./middleware/errorHandler');
const { 
  configureCORS, 
  securityHeaders, 
  requestLogger,
  validateBodySize
} = require('./middleware/auth');

// Import routes
const catalogRoutes = require('./routes/catalog');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const rfqRoutes = require('./routes/rfq');
const creditRoutes = require('./routes/credit');
const reviewRoutes = require('./routes/reviews');
const supportRoutes = require('./routes/support');
const grievanceRoutes = require('./routes/grievances');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

const app = express();
const port = process.env.PORT || 4000;

// Security middleware (before other middleware)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));
app.use(securityHeaders);

// CORS configuration
app.use(configureCORS());

// Body parsing middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(validateBodySize);

// Request logging (log all incoming requests)
app.use(requestLogger);

// Static file serving
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// Health check endpoint (simple - doesn't require database)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Database health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbHealth.healthy ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: error.message
    });
  }
});

// API routes
app.use('/api', authRoutes);      // Auth routes (no auth required)
app.use('/api', catalogRoutes);   // Catalog routes (public/protected)
app.use('/api', cartRoutes);      // Cart routes (protected)
app.use('/api', orderRoutes);     // Order routes (protected)
app.use('/api', paymentRoutes);   // Payment routes (Razorpay integration)
app.use('/api', rfqRoutes);       // RFQ routes (protected)
app.use('/api', creditRoutes);    // Credit routes (protected)
app.use('/api', reviewRoutes);    // Review routes (protected)
app.use('/api', supportRoutes);   // Support routes (public/protected)
app.use('/api', grievanceRoutes); // Grievance routes (protected)
app.use('/api', adminRoutes);     // Admin routes (admin only)
app.use('/api/notifications', notificationRoutes); // Notification routes (Phase 5)

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  logger.info(`Server started on port ${port}`, {
    environment: process.env.NODE_ENV || 'development',
    port: port
  });
});

// Graceful shutdown handler
function gracefulShutdown(signal) {
  logger.info(`${signal} received, starting graceful shutdown`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    db.closePool()
      .then(() => {
        logger.info('Database connections closed');
        process.exit(0);
      })
      .catch((err) => {
        logger.error('Error closing database', { error: err.message });
        process.exit(1);
      });
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
