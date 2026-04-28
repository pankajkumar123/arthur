const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { ValidationError, NotFoundError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const razorpay = require('../utils/razorpay');
const emailService = require('../utils/emailService');
const emailServiceEnhanced = require('../utils/emailServiceEnhanced');
const smsService = require('../utils/smsServiceTwilio');
const pdfService = require('../utils/pdfService');
const notificationPreferences = require('../utils/notificationPreferences');

const router = express.Router();

/**
 * POST /api/payment/create-order
 * Create a Razorpay payment order
 */
router.post('/payment/create-order', authenticateToken, asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ValidationError('orderId required');
  }

  // Get order details
  const orderResult = await db.query(
    `SELECT id, order_number, total_amount, customer_id, status
     FROM orders
     WHERE id = $1 AND customer_id = $2`,
    [orderId, req.user.id]
  );

  if (orderResult.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  const order = orderResult.rows[0];

  // Check if payment already initiated
  if (order.status !== 'pending') {
    throw new ValidationError(`Cannot pay for order with status: ${order.status}`);
  }

  // Create Razorpay order (amount in paise)
  const razorpayOrder = await razorpay.createOrder({
    amount: Math.round(order.total_amount * 100), // Convert to paise
    currency: 'INR',
    receipt: order.order_number,
    description: `Order ${order.order_number}`,
    notes: {
      orderId: orderId,
      customerId: req.user.id
    }
  });

  logger.info('Razorpay order created', {
    orderId,
    razorpayOrderId: razorpayOrder.id,
    amount: order.total_amount
  });

  res.json({
    razorpayOrderId: razorpayOrder.id,
    amount: Math.round(order.total_amount * 100),
    currency: 'INR',
    orderId: orderId,
    orderNumber: order.order_number,
    customerEmail: req.user.email,
    key: process.env.RAZORPAY_KEY_ID
  });
}));

/**
 * POST /api/payment/verify
 * Verify payment signature and update order status
 */
router.post('/payment/verify', authenticateToken, asyncHandler(async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body;

  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !orderId) {
    throw new ValidationError('Missing payment verification data');
  }

  // Verify signature
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    logger.error('Payment signature verification failed', {
      orderId,
      razorpayOrderId,
      expected: expectedSignature,
      received: razorpaySignature
    });
    throw new ValidationError('Payment signature verification failed');
  }

  // Get order with complete details
  const orderResult = await db.query(
    `SELECT o.id, o.customer_id, o.order_number, o.total_amount, o.subtotal, o.gst_amount, 
            o.shipping_cost, o.delivery_address, o.city, o.state, o.pincode, o.payment_method,
            c.full_name, c.email, c.phone
     FROM orders o
     JOIN customer_user c ON c.id = o.customer_id
     WHERE o.id = $1 AND o.customer_id = $2`,
    [orderId, req.user.id]
  );

  if (orderResult.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  const order = orderResult.rows[0];

  // Get order items with product details
  const itemsResult = await db.query(
    `SELECT oi.quantity, oi.unit_price, p.name as product_name, p.sku
     FROM order_items oi
     JOIN product p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  const items = itemsResult.rows.map(item => ({
    productName: item.product_name,
    sku: item.sku,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unit_price),
    lineTotal: parseFloat(item.unit_price) * item.quantity
  }));

  // Update order status to confirmed
  await db.query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
    ['confirmed', orderId]
  );

  // Log payment transaction
  await db.query(
    `INSERT INTO payment_logs (order_id, transaction_id, razorpay_order_id, amount, status, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      orderId,
      razorpayPaymentId,
      razorpayOrderId,
      order.total_amount,
      'success',
      JSON.stringify({
        signature_verified: true,
        verification_timestamp: new Date().toISOString()
      })
    ]
  );

  logger.info('Payment verified and order confirmed', {
    orderId,
    transactionId: razorpayPaymentId,
    amount: order.total_amount,
    customerId: req.user.id
  });

  // ===== PHASE 4+5 INTEGRATION: Auto-trigger notifications =====
  
  // Check notification preferences
  const preferences = await notificationPreferences.getPreferences(req.user.id);
  
  // 1. Send enhanced email confirmation with order details
  if (await notificationPreferences.shouldNotify(req.user.id, 'order_confirmation', 'email')) {
    try {
      await emailServiceEnhanced.sendOrderConfirmation(
        order.email,
        {
          orderNumber: order.order_number,
          orderId: orderId,
          totalAmount: parseFloat(order.total_amount),
          subtotal: parseFloat(order.subtotal),
          gst: parseFloat(order.gst_amount),
          shipping: parseFloat(order.shipping_cost),
          items: items,
          customerName: order.full_name,
          transactionId: razorpayPaymentId,
          paymentMethod: order.payment_method,
          deliveryAddress: {
            line: order.delivery_address,
            city: order.city,
            state: order.state,
            pincode: order.pincode
          }
        }
      );
      logger.info('Order confirmation email sent', { orderId, email: order.email });
    } catch (emailError) {
      logger.error('Enhanced email sending failed', { orderId, error: emailError.message });
    }
  }

  // 2. Send SMS notification if phone number available
  if (order.phone && await notificationPreferences.shouldNotify(req.user.id, 'order_confirmation', 'sms')) {
    try {
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days estimate
      
      await smsService.sendOrderConfirmationSMS(
        order.phone,
        {
          orderNumber: order.order_number,
          totalAmount: parseFloat(order.total_amount).toFixed(2),
          estimatedDelivery: estimatedDelivery.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short' 
          })
        }
      );
      logger.info('Order confirmation SMS sent', { orderId, phone: order.phone });
    } catch (smsError) {
      logger.error('SMS sending failed', { orderId, error: smsError.message });
    }
  }

  // 3. Generate PDF invoice
  try {
    const invoiceData = {
      orderId: orderId,
      orderNumber: order.order_number,
      orderDate: new Date(),
      customer: {
        name: order.full_name,
        email: order.email,
        phone: order.phone,
        address: {
          line: order.delivery_address,
          city: order.city,
          state: order.state,
          pincode: order.pincode
        }
      },
      items: items,
      subtotal: parseFloat(order.subtotal),
      gst: parseFloat(order.gst_amount),
      shipping: parseFloat(order.shipping_cost),
      total: parseFloat(order.total_amount),
      payment: {
        method: order.payment_method,
        transactionId: razorpayPaymentId,
        status: 'paid'
      }
    };

    await pdfService.generateInvoicePDF(invoiceData);
    logger.info('Invoice PDF generated', { orderId, orderNumber: order.order_number });

    // Email the invoice PDF
    if (preferences && preferences.email_enabled) {
      try {
        const invoicePath = pdfService.getInvoicePath(orderId);
        await emailServiceEnhanced.sendInvoiceEmail(
          order.email,
          {
            customerName: order.full_name,
            orderNumber: order.order_number,
            totalAmount: parseFloat(order.total_amount),
            invoicePath: invoicePath
          }
        );
        logger.info('Invoice email sent', { orderId });
      } catch (invoiceEmailError) {
        logger.error('Invoice email failed', { orderId, error: invoiceEmailError.message });
      }
    }
  } catch (pdfError) {
    logger.error('PDF invoice generation failed', { orderId, error: pdfError.message });
  }
  
  // Log notification sent to database
  try {
    await db.query(
      `INSERT INTO notifications (customer_id, type, channel, status, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        'order_confirmation',
        'email',
        'sent',
        JSON.stringify({ orderId, orderNumber: order.order_number })
      ]
    );
  } catch (notifLogError) {
    logger.error('Failed to log notification', { error: notifLogError.message });
  }

  res.json({
    message: 'Payment verified successfully',
    orderId,
    transactionId: razorpayPaymentId,
    status: 'confirmed'
  });
}));

/**
 * POST /api/payment/webhook
 * Razorpay webhook for payment events
 */
router.post('/payment/webhook', asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    logger.error('Webhook signature verification failed', { signature, expectedSignature });
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, payload } = req.body;

  logger.info('Webhook received', { event });

  try {
    if (event === 'payment.authorized') {
      // Payment authorized but not captured yet
      const paymentId = payload.payment.entity.id;
      const razorpayOrderId = payload.payment.entity.order_id;

      logger.info('Payment authorized', { paymentId, razorpayOrderId });
    }

    if (event === 'payment.failed') {
      // Payment failed
      const paymentId = payload.payment.entity.id;
      const razorpayOrderId = payload.payment.entity.order_id;
      const error = payload.payment.entity.error_description;
      // Razorpay stores the orderId we passed in notes when creating the order
      const notes = payload.payment.entity.notes || {};
      const orderId = notes.orderId ? parseInt(notes.orderId, 10) : null;

      logger.error('Payment failed via webhook', { paymentId, razorpayOrderId, orderId, error });

      if (orderId) {
        // Mark the order back to pending so the customer can retry
        await db.query(
          `UPDATE orders SET status = 'pending', updated_at = NOW() WHERE id = $1`,
          [orderId]
        );

        // Log the failed payment attempt
        await db.query(
          `INSERT INTO payment_logs (order_id, transaction_id, razorpay_order_id, amount, status, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderId,
            paymentId,
            razorpayOrderId,
            0,
            'failed',
            JSON.stringify({ error })
          ]
        );
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error', { error: error.message });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}));

/**
 * GET /api/payment/status/:orderId
 * Get payment status for an order
 */
router.get('/payment/status/:orderId', authenticateToken, asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Get order status
  const orderResult = await db.query(
    `SELECT id, status FROM orders WHERE id = $1 AND customer_id = $2`,
    [orderId, req.user.id]
  );

  if (orderResult.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  const order = orderResult.rows[0];

  // Get latest payment log
  const paymentResult = await db.query(
    `SELECT transaction_id, status, created_at FROM payment_logs
     WHERE order_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [orderId]
  );

  res.json({
    orderId,
    orderStatus: order.status,
    paymentStatus: paymentResult.rows.length > 0 ? paymentResult.rows[0].status : 'pending',
    transactionId: paymentResult.rows.length > 0 ? paymentResult.rows[0].transaction_id : null,
    lastUpdated: paymentResult.rows.length > 0 ? paymentResult.rows[0].created_at : null
  });
}));

/**
 * GET /api/payment/invoice/:orderId
 * Generate invoice PDF for order
 */
router.get('/payment/invoice/:orderId', authenticateToken, asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Get order details
  const orderResult = await db.query(
    `SELECT id, order_number, subtotal, gst_amount, shipping_cost, total_amount,
            delivery_address, city, state, pincode, status, created_at
     FROM orders
     WHERE id = $1 AND customer_id = $2`,
    [orderId, req.user.id]
  );

  if (orderResult.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  const order = orderResult.rows[0];

  // Get customer details
  const customerResult = await db.query(
    'SELECT full_name, email, phone FROM customer_user WHERE id = $1',
    [req.user.id]
  );

  // Get order items
  const itemsResult = await db.query(
    `SELECT oi.product_id, oi.quantity, oi.unit_price, p.name
     FROM order_items oi
     JOIN product p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  // Generate invoice data
  const invoiceData = {
    orderNumber: order.order_number,
    orderDate: new Date(order.created_at).toLocaleDateString('en-IN'),
    customer: customerResult.rows[0],
    address: `${order.delivery_address}, ${order.city}, ${order.state} ${order.pincode}`,
    items: itemsResult.rows,
    subtotal: order.subtotal,
    gst: order.gst_amount,
    shipping: order.shipping_cost,
    total: order.total_amount,
    status: order.status
  };

  // For now, return JSON (Phase 4 extension can add PDF generation with pdfkit)
  res.json({
    success: true,
    invoice: invoiceData,
    message: 'Invoice data exported successfully. PDF generation available in Phase 4 extension.'
  });
}));

module.exports = router;
