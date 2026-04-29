const logger = require('./logger');

let razorpay = null;

// Safe initialization
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay');

  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  logger.info("✅ Razorpay initialized");
} else {
  logger.warn("⚠️ Razorpay disabled (missing keys)");
}

/**
 * Create a Razorpay order
 */
async function createOrder(options) {
  try {
    // 👉 MOCK MODE
    if (!razorpay) {
      return {
        id: "mock_order_" + Date.now(),
        amount: options.amount,
        currency: options.currency || 'INR',
        status: "created"
      };
    }

    const order = await razorpay.orders.create({
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      description: options.description,
      notes: options.notes || {}
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
 * Fetch order
 */
async function fetchOrder(orderId) {
  if (!razorpay) return {};

  return razorpay.orders.fetch(orderId);
}

/**
 * Fetch payment
 */
async function fetchPayment(paymentId) {
  if (!razorpay) return {};

  return razorpay.payments.fetch(paymentId);
}

/**
 * Capture payment
 */
async function capturePayment(paymentId, amount) {
  try {
    if (!razorpay) {
      return {
        id: paymentId,
        amount,
        status: "captured"
      };
    }

    return await razorpay.payments.capture(paymentId, amount);
  } catch (error) {
    logger.error('Failed to capture payment', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Refund payment
 */
async function refundPayment(paymentId, amount, notes) {
  try {
    if (!razorpay) {
      return {
        id: "mock_refund",
        paymentId,
        amount
      };
    }

    return await razorpay.payments.refund(paymentId, {
      amount,
      notes: {
        reason: notes || 'Mock refund'
      }
    });
  } catch (error) {
    logger.error('Failed to refund payment', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Fetch refund
 */
async function fetchRefund(refundId) {
  if (!razorpay) return {};

  return razorpay.refunds.fetch(refundId);
}

/**
 * Fetch order payments
 */
async function fetchOrderPayments(orderId) {
  if (!razorpay) return [];

  const payments = await razorpay.orders.fetchPayments(orderId);
  return payments.items || [];
}

/**
 * Create payment link
 */
async function createPaymentLink(options) {
  try {
    if (!razorpay) {
      return {
        id: "mock_link",
        amount: options.amount,
        status: "created"
      };
    }

    return await razorpay.paymentLink.create({
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
  } catch (error) {
    logger.error('Failed to create payment link', {
      error: error.message
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