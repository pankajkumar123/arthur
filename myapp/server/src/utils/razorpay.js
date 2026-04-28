const Razorpay = require('razorpay');
const logger = require('./logger');

// Initialize Razorpay with credentials from environment
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Razorpay order
 * @param {Object} options - Order options
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency code (e.g., 'INR')
 * @param {string} options.receipt - Unique receipt ID
 * @param {string} options.description - Order description
 * @param {Object} options.notes - Custom notes/metadata
 * @returns {Promise<Object>} Created Razorpay order
 */
async function createOrder(options) {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      description: options.description,
      notes: options.notes || {}
    });

    logger.info('Razorpay order created', {
      razorpayOrderId: order.id,
      amount: options.amount
    });

    return order;
  } catch (error) {
    logger.error('Failed to create Razorpay order', {
      error: error.message,
      options
    });
    throw error;
  }
}

/**
 * Fetch order details from Razorpay
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<Object>} Order details
 */
async function fetchOrder(orderId) {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    logger.error('Failed to fetch Razorpay order', {
      error: error.message,
      orderId
    });
    throw error;
  }
}

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
async function fetchPayment(paymentId) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    logger.error('Failed to fetch Razorpay payment', {
      error: error.message,
      paymentId
    });
    throw error;
  }
}

/**
 * Capture payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount in paise
 * @returns {Promise<Object>} Captured payment
 */
async function capturePayment(paymentId, amount) {
  try {
    const payment = await razorpay.payments.capture(paymentId, amount);
    logger.info('Payment captured', { paymentId, amount });
    return payment;
  } catch (error) {
    logger.error('Failed to capture payment', {
      error: error.message,
      paymentId,
      amount
    });
    throw error;
  }
}

/**
 * Refund payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount in paise (optional, full refund if not provided)
 * @param {string} notes - Refund reason/notes
 * @returns {Promise<Object>} Refund details
 */
async function refundPayment(paymentId, amount, notes) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount,
      notes: {
        reason: notes || 'Customer requested refund'
      }
    });

    logger.info('Payment refunded', {
      paymentId,
      amount,
      refundId: refund.id
    });

    return refund;
  } catch (error) {
    logger.error('Failed to refund payment', {
      error: error.message,
      paymentId,
      amount
    });
    throw error;
  }
}

/**
 * Fetch refund details
 * @param {string} refundId - Razorpay refund ID
 * @returns {Promise<Object>} Refund details
 */
async function fetchRefund(refundId) {
  try {
    const refund = await razorpay.refunds.fetch(refundId);
    return refund;
  } catch (error) {
    logger.error('Failed to fetch refund', {
      error: error.message,
      refundId
    });
    throw error;
  }
}

/**
 * Fetch all payments for an order
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<Array>} Array of payment objects
 */
async function fetchOrderPayments(orderId) {
  try {
    const payments = await razorpay.orders.fetchPayments(orderId);
    return payments.items || [];
  } catch (error) {
    logger.error('Failed to fetch order payments', {
      error: error.message,
      orderId
    });
    throw error;
  }
}

/**
 * Create payment link (for QR codes, emails, etc.)
 * @param {Object} options - Link options
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency
 * @param {string} options.description - Link description
 * @param {string} options.customer_email - Customer email
 * @param {string} options.customer_phone - Customer phone
 * @returns {Promise<Object>} Payment link details
 */
async function createPaymentLink(options) {
  try {
    const link = await razorpay.paymentLink.create({
      amount: options.amount,
      currency: options.currency || 'INR',
      description: options.description,
      customer: {
        email: options.customer_email,
        phone: options.customer_phone
      },
      notify: {
        sms: true,
        email: true
      },
      notes: options.notes || {}
    });

    logger.info('Payment link created', {
      linkId: link.id,
      amount: options.amount
    });

    return link;
  } catch (error) {
    logger.error('Failed to create payment link', {
      error: error.message,
      options
    });
    throw error;
  }
}

module.exports = {
  createOrder,
  fetchOrder,
  fetchPayment,
  capturePayment,
  refundPayment,
  fetchRefund,
  fetchOrderPayments,
  createPaymentLink
};
