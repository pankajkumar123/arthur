const nodemailer = require('nodemailer');
const logger = require('./logger');

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send order confirmation email
 * @param {string} email - Customer email
 * @param {Object} orderData - Order details
 * @param {string} orderData.orderNumber - Order number
 * @param {number} orderData.orderId - Order ID
 * @param {number} orderData.totalAmount - Total amount
 * @param {string} orderData.transactionId - Transaction/Payment ID
 */
async function sendOrderConfirmation(email, orderData) {
  try {
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Order Confirmed! 🎉</h2>
            
            <p>Dear Customer,</p>
            
            <p>Thank you for your order! We're excited to help you get the products you need.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Order Details</h3>
              <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Total Amount:</strong> ₹${orderData.totalAmount.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
              <p><strong>Transaction ID:</strong> ${orderData.transactionId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <h3 style="color: #2c3e50;">What's Next?</h3>
            <ol>
              <li>We'll prepare your order for shipment</li>
              <li>You'll receive a shipping notification with tracking details</li>
              <li>Track your order in your dashboard</li>
              <li>Receive your products at your doorstep</li>
            </ol>
            
            <p>If you have any questions, please visit our <a href="${process.env.FRONTEND_URL}/HelpCentre.html">Help Centre</a> or contact us.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this email address.
            </p>
            
            <p style="color: #666; font-size: 12px;">
              <strong>Sai Scientifics</strong><br>
              Industrial Equipment & Supplies
            </p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmed - ${orderData.orderNumber}`,
      html: htmlContent
    });

    logger.info('Order confirmation email sent', {
      email,
      orderNumber: orderData.orderNumber
    });

    return true;
  } catch (error) {
    logger.error('Failed to send order confirmation email', {
      error: error.message,
      email,
      orderNumber: orderData.orderNumber
    });
    throw error;
  }
}

/**
 * Send payment receipt email
 * @param {string} email - Customer email
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.orderNumber - Order number
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.transactionId - Transaction ID
 * @param {string} paymentData.paymentMethod - Payment method
 */
async function sendPaymentReceipt(email, paymentData) {
  try {
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #27ae60;">Payment Received! ✓</h2>
            
            <p>Dear Customer,</p>
            
            <p>We've successfully received your payment. Thank you!</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Receipt Details</h3>
              <p><strong>Order Number:</strong> ${paymentData.orderNumber}</p>
              <p><strong>Amount Paid:</strong> ₹${paymentData.amount.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
              <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
              <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
              <p><strong>Date & Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
              <p style="color: #27ae60; font-weight: bold;">Status: Payment Confirmed</p>
            </div>
            
            <p>Your order will be processed immediately and shipped to your address. You'll receive tracking details shortly.</p>
            
            <div style="background-color: #fef5e7; padding: 15px; border-left: 4px solid #f39c12; margin: 20px 0;">
              <p style="margin: 0;"><strong>💡 Tip:</strong> Track your order anytime in your dashboard.</p>
            </div>
            
            <p>Thank you for shopping with Sai Scientifics!</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this email address.
            </p>
            
            <p style="color: #666; font-size: 12px;">
              <strong>Sai Scientifics</strong><br>
              Industrial Equipment & Supplies
            </p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Payment Receipt - ${paymentData.orderNumber}`,
      html: htmlContent
    });

    logger.info('Payment receipt email sent', {
      email,
      orderNumber: paymentData.orderNumber,
      amount: paymentData.amount
    });

    return true;
  } catch (error) {
    logger.error('Failed to send payment receipt email', {
      error: error.message,
      email,
      orderNumber: paymentData.orderNumber
    });
    throw error;
  }
}

/**
 * Send shipment notification email
 * @param {string} email - Customer email
 * @param {Object} shipmentData - Shipment details
 * @param {string} shipmentData.orderNumber - Order number
 * @param {string} shipmentData.trackingNumber - Tracking number
 * @param {string} shipmentData.trackingUrl - Tracking URL
 * @param {string} shipmentData.carrier - Shipping carrier
 */
async function sendShipmentNotification(email, shipmentData) {
  try {
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3498db;">Your Order is Shipped! 📦</h2>
            
            <p>Dear Customer,</p>
            
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Shipment Details</h3>
              <p><strong>Order Number:</strong> ${shipmentData.orderNumber}</p>
              <p><strong>Tracking Number:</strong> ${shipmentData.trackingNumber}</p>
              <p><strong>Carrier:</strong> ${shipmentData.carrier}</p>
              <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${shipmentData.trackingUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Track Your Order
              </a>
            </div>
            
            <p>You can also track your order anytime in your dashboard.</p>
            
            <p>Expected delivery: In 3-5 business days</p>
            
            <p>If you have any questions about your shipment, please contact our support team.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this email address.
            </p>
            
            <p style="color: #666; font-size: 12px;">
              <strong>Sai Scientifics</strong><br>
              Industrial Equipment & Supplies
            </p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Shipped - ${shipmentData.orderNumber}`,
      html: htmlContent
    });

    logger.info('Shipment notification email sent', {
      email,
      orderNumber: shipmentData.orderNumber,
      trackingNumber: shipmentData.trackingNumber
    });

    return true;
  } catch (error) {
    logger.error('Failed to send shipment notification email', {
      error: error.message,
      email,
      orderNumber: shipmentData.orderNumber
    });
    throw error;
  }
}

/**
 * Test email configuration
 */
async function testConnection() {
  try {
    await transporter.verify();
    logger.info('Email service connected successfully');
    return true;
  } catch (error) {
    logger.error('Email service connection failed', {
      error: error.message
    });
    return false;
  }
}

module.exports = {
  sendOrderConfirmation,
  sendPaymentReceipt,
  sendShipmentNotification,
  testConnection
};
