/**
 * Notification API Routes
 * Handles all notification-related endpoints
 * Routes:
 *   GET  /api/notifications/preferences - Get notification settings
 *   PUT  /api/notifications/preferences - Update notification settings
 *   GET  /api/notifications/send-test - Send test email/SMS
 *   POST /api/notifications/subscribe - Subscribe to newsletter
 *   POST /api/notifications/unsubscribe - Unsubscribe from newsletter
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { ValidationError, AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Import notification services
const notificationPreferences = require('../utils/notificationPreferences');
const emailService = require('../utils/emailServiceEnhanced');
const smsService = require('../utils/smsServiceTwilio');
const pdfService = require('../utils/pdfService');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * GET /api/notifications/preferences
 * Get customer's notification preferences
 */
router.get('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const customerId = req.userId;

  const result = await notificationPreferences.getPreferences(customerId);

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  res.json({
    success: true,
    preferences: result.preferences
  });
}));

/**
 * PUT /api/notifications/preferences
 * Update notification preferences
 */
router.put('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const customerId = req.userId;
  const updates = req.body;

  // Validate input
  if (!updates || Object.keys(updates).length === 0) {
    throw new ValidationError('No updates provided');
  }

  const result = await notificationPreferences.updatePreferences(customerId, updates);

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  logger.info(`Notification preferences updated for customer ${customerId}`);

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    preferences: result.preferences
  });
}));

/**
 * PUT /api/notifications/preferences/all
 * Enable/disable all notifications at once
 */
router.put('/preferences/all', authenticateToken, asyncHandler(async (req, res) => {
  const customerId = req.userId;
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    throw new ValidationError('enabled must be a boolean');
  }

  const result = await notificationPreferences.setAllNotifications(customerId, enabled);

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  res.json({
    success: true,
    message: `All notifications ${enabled ? 'enabled' : 'disabled'}`,
    preferences: result.preferences
  });
}));

/**
 * GET /api/notifications/summary
 * Get notification summary for dashboard
 */
router.get('/summary', authenticateToken, asyncHandler(async (req, res) => {
  const customerId = req.userId;

  const result = await notificationPreferences.getNotificationSummary(customerId);

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  res.json(result);
}));

/**
 * POST /api/notifications/send-test
 * Send test notification (email/SMS/WhatsApp)
 */
router.post('/send-test', authenticateToken, asyncHandler(async (req, res) => {
  const customerId = req.userId;
  const { type = 'email' } = req.body; // 'email', 'sms', 'whatsapp'

  // Get customer details
  const customerResult = await pool.query(
    'SELECT email, phone, full_name FROM customer_user WHERE id = $1',
    [customerId]
  );

  if (customerResult.rows.length === 0) {
    throw new AppError('Customer not found', 404);
  }

  const customer = customerResult.rows[0];

  let testResult = { success: false };

  if (type === 'email') {
    testResult = await emailService.sendOrderConfirmation(customer.email, {
      orderNumber: 'TEST-001',
      orderId: 0,
      totalAmount: 1000,
      items: [
        {
          productName: 'Test Product',
          quantity: 1,
          unitPrice: 1000,
          lineTotal: 1000
        }
      ],
      customerName: customer.full_name,
      transactionId: 'TEST-TRANSACTION'
    });
  } else if (type === 'sms') {
    if (!customer.phone) {
      throw new ValidationError('Phone number not found in profile');
    }
    testResult = await smsService.sendSMS(
      customer.phone,
      `Test SMS from Sai Scientifics. Your test message ID: TEST-${Date.now()}`
    );
  } else if (type === 'whatsapp') {
    if (!customer.phone) {
      throw new ValidationError('Phone number not found in profile');
    }
    testResult = await smsService.sendWhatsApp(
      customer.phone,
      'This is a test WhatsApp message from Sai Scientifics.'
    );
  } else {
    throw new ValidationError('Invalid notification type');
  }

  if (!testResult.success) {
    throw new AppError(`Failed to send ${type}: ${testResult.error}`, 500);
  }

  res.json({
    success: true,
    message: `Test ${type} sent successfully`,
    result: testResult
  });
}));

/**
 * POST /api/notifications/subscribe
 * Subscribe to newsletter
 */
router.post('/subscribe', authenticateToken, asyncHandler(async (req, res) => {
  const customerId = req.userId;

  const result = await notificationPreferences.updatePreferences(customerId, {
    email_newsletter: true
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  logger.info(`Customer ${customerId} subscribed to newsletter`);

  res.json({
    success: true,
    message: 'Successfully subscribed to newsletter'
  });
}));

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from newsletter
 */
router.post('/unsubscribe', authenticateToken, asyncHandler(async (req, res) => {
  const customerId = req.userId;

  const result = await notificationPreferences.updatePreferences(customerId, {
    email_newsletter: false
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  logger.info(`Customer ${customerId} unsubscribed from newsletter`);

  res.json({
    success: true,
    message: 'Successfully unsubscribed from newsletter'
  });
}));

/**
 * GET /api/notifications/invoice/:orderId
 * Get invoice (download as PDF or JSON)
 */
router.get('/invoice/:orderId', authenticateToken, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const customerId = req.userId;

  // Verify order belongs to this customer
  const orderResult = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND customer_id = $2',
    [orderId, customerId]
  );

  if (orderResult.rows.length === 0) {
    throw new AppError('Order not found', 404);
  }

  const order = orderResult.rows[0];

  // Get order items
  const itemsResult = await pool.query(
    `SELECT oi.*, p.name as product_name 
     FROM order_items oi 
     JOIN product p ON oi.product_id = p.id 
     WHERE oi.order_id = $1`,
    [orderId]
  );

  const invoiceData = {
    invoiceNumber: `INV-${Date.now()}-${orderId}`,
    invoiceDate: new Date().toLocaleDateString('en-IN'),
    orderId,
    orderNumber: `ORD-${orderId}`,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    customerAddress: `${order.address}, ${order.city}, ${order.state} ${order.pincode}`,
    items: itemsResult.rows.map(item => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.price),
      lineTotal: parseFloat(item.quantity) * parseFloat(item.price)
    })),
    subtotal: parseFloat(order.total_amount) / 1.18,
    gstAmount: (parseFloat(order.total_amount) * 0.18) / 1.18,
    totalAmount: parseFloat(order.total_amount),
    transactionId: order.transaction_id || 'N/A',
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status || 'pending',
    orderStatus: order.status || 'pending'
  };

  // Check query parameter for format
  if (req.query.format === 'pdf') {
    // Generate PDF
    const filePath = pdfService.getInvoicePath(orderId);
    const invoiceStream = pdfService.generateInvoiceStream(invoiceData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);
    invoiceStream.pipe(res);
  } else {
    // Return JSON
    res.json({
      success: true,
      invoice: invoiceData
    });
  }
}));

/**
 * POST /api/notifications/send-invoice/:orderId
 * Email invoice to customer
 */
router.post('/send-invoice/:orderId', authenticateToken, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const customerId = req.userId;

  // Verify order belongs to this customer
  const orderResult = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND customer_id = $2',
    [orderId, customerId]
  );

  if (orderResult.rows.length === 0) {
    throw new AppError('Order not found', 404);
  }

  const order = orderResult.rows[0];

  // Generate PDF
  const invoiceStream = pdfService.generateInvoicePDF({
    invoiceNumber: `INV-${orderId}`,
    invoiceDate: new Date().toLocaleDateString('en-IN'),
    orderId,
    orderNumber: `ORD-${orderId}`,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    customerAddress: order.address,
    items: [],
    subtotal: parseFloat(order.total_amount) / 1.18,
    totalAmount: parseFloat(order.total_amount),
    transactionId: order.transaction_id || 'N/A'
  });

  logger.info(`Invoice generated and sent to ${order.customer_email}`);

  res.json({
    success: true,
    message: 'Invoice sent to your email'
  });
}));

/**
 * GET /api/notifications/history
 * Get notification history
 */
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const customerId = req.userId;
  const limit = req.query.limit || 20;

  try {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE customer_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [customerId, limit]
    );

    res.json({
      success: true,
      notifications: result.rows
    });
  } catch (error) {
    // Table might not exist yet
    res.json({
      success: true,
      notifications: []
    });
  }
}));

module.exports = router;
