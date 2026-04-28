/**
 * Enhanced Email Service
 * Sends professional HTML emails for different scenarios
 * Supports: Order confirmations, shipment tracking, invoices, support responses
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send order confirmation email (after payment verified)
 */
async function sendOrderConfirmation(email, orderData) {
  const { orderNumber, orderId, totalAmount, items, customerName, transactionId } = orderData;
  
  const itemsHTML = items
    .map(item => `
      <tr>
        <td style="border-bottom: 1px solid #ddd; padding: 12px;">
          ${item.productName}
        </td>
        <td align="right" style="border-bottom: 1px solid #ddd; padding: 12px;">
          ${item.quantity} x ₹${item.unitPrice.toFixed(2)}
        </td>
        <td align="right" style="border-bottom: 1px solid #ddd; padding: 12px;">
          ₹${item.lineTotal.toFixed(2)}
        </td>
      </tr>
    `)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-details { background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .order-details h3 { margin-top: 0; color: #667eea; }
        .order-details p { margin: 10px 0; }
        .order-details strong { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
        .summary-row:last-child { border-bottom: none; }
        .summary-row.total { font-size: 18px; font-weight: bold; color: #667eea; }
        .next-steps { background: #e8f4f8; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
        .next-steps h4 { margin-top: 0; color: #667eea; }
        .next-steps ol { margin: 10px 0; padding-left: 20px; }
        .next-steps li { margin: 8px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px 10px 0; font-weight: bold; }
        .button:hover { background: #764ba2; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
        .badge { display: inline-block; background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Order Confirmed <span class="badge">PAID</span></h1>
          <p>Thank you for your order!</p>
        </div>
        
        <div class="content">
          <p>Hello <strong>${customerName}</strong>,</p>
          
          <p>We're excited to inform you that your payment has been received and your order is now confirmed!</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <h4>Order Items:</h4>
          <table>
            <thead>
              <tr style="background: #667eea; color: white;">
                <th style="padding: 12px; text-align: left;">Product</th>
                <th align="right" style="padding: 12px;">Rate</th>
                <th align="right" style="padding: 12px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <strong>₹${(totalAmount / 1.18).toFixed(2)}</strong>
            </div>
            <div class="summary-row">
              <span>GST (18%):</span>
              <strong>₹${((totalAmount * 0.18) / 1.18).toFixed(2)}</strong>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <strong>₹0.00 (Free)</strong>
            </div>
            <div class="summary-row total">
              <span>Total Paid:</span>
              <strong>₹${totalAmount.toFixed(2)}</strong>
            </div>
          </div>
          
          <div class="next-steps">
            <h4>What happens next?</h4>
            <ol>
              <li><strong>Order Verification:</strong> We'll verify and process your order within 24 hours</li>
              <li><strong>Preparation:</strong> Our warehouse team will pick and pack your items</li>
              <li><strong>Dispatch:</strong> Your package will be shipped within 2-3 business days</li>
              <li><strong>Delivery:</strong> You'll receive tracking updates via email and SMS</li>
            </ol>
          </div>
          
          <p>
            <a href="${process.env.FRONTEND_URL}/Dashboard.html?orderid=${orderId}" class="button">View Order Status</a>
            <a href="${process.env.FRONTEND_URL}/Grievance.html" class="button" style="background: #6c757d;">Contact Support</a>
          </p>
          
          <hr style="border: none; border-top: 2px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply to this address.
            <br>
            For queries, visit our support center or contact sales@saiscientifics.com
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">
            © 2026 Sai Scientifics. All rights reserved.<br>
            Industrial Area, Gurgaon, Haryana 122003<br>
            📞 +91-9182-755-68 | 📧 sales@saiscientifics.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Sai Scientifics <sales@saiscientifics.com>',
      to: email,
      subject: `Order Confirmed - ${orderNumber}`,
      html
    });
    
    logger.info(`Order confirmation email sent to ${email} for order ${orderNumber}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send order confirmation email: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send shipment notification email (when order ships)
 */
async function sendShipmentNotification(email, shipmentData) {
  const { orderNumber, trackingNumber, courierName, estimatedDelivery, customerName, items } = shipmentData;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .tracking-box { background: #f0f8ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .tracking-box h3 { margin-top: 0; color: #667eea; }
        .tracking-code { background: white; padding: 15px; border: 2px dashed #667eea; text-align: center; font-size: 18px; font-weight: bold; margin: 10px 0; border-radius: 4px; font-family: monospace; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px 10px 0; font-weight: bold; }
        .timeline { margin: 20px 0; }
        .timeline-item { display: flex; margin: 15px 0; }
        .timeline-dot { width: 40px; height: 40px; background: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
        .timeline-content h4 { margin: 0 0 5px 0; color: #667eea; }
        .timeline-content p { margin: 0; color: #666; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order is on the Way!</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          
          <p>Great news! Your order has been dispatched and is on its way to you.</p>
          
          <div class="tracking-box">
            <h3>Tracking Information</h3>
            <p><strong>Courier:</strong> ${courierName}</p>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Tracking Number:</strong></p>
            <div class="tracking-code">${trackingNumber}</div>
            <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
          </div>
          
          <p>
            <a href="https://www.${courierName.toLowerCase().replace(/ /g, '')}.com/track" class="button" target="_blank">Track Your Package</a>
          </p>
          
          <h4>Shipment Timeline:</h4>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot">✓</div>
              <div class="timeline-content">
                <h4>Order Dispatched</h4>
                <p>Your package left our warehouse</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot">📍</div>
              <div class="timeline-content">
                <h4>In Transit</h4>
                <p>Currently with ${courierName}</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot">🚚</div>
              <div class="timeline-content">
                <h4>Out for Delivery</h4>
                <p>Package will arrive soon</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot">📬</div>
              <div class="timeline-content">
                <h4>Delivered</h4>
                <p>By ${estimatedDelivery}</p>
              </div>
            </div>
          </div>
          
          <p style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>⚠️ Important:</strong> Please provide a clear delivery address to the courier. Make sure someone is available to receive the package.
          </p>
          
          <p>
            Questions? <a href="${process.env.FRONTEND_URL}/HelpCentre.html">Visit our Help Center</a> or reply to this email.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2026 Sai Scientifics. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Sai Scientifics <sales@saiscientifics.com>',
      to: email,
      subject: `Your Order is Dispatched - ${orderNumber}`,
      html
    });
    
    logger.info(`Shipment notification email sent to ${email} for order ${orderNumber}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send shipment notification: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send delivered notification
 */
async function sendDeliveryNotification(email, deliveryData) {
  const { orderNumber, customerName, deliveryDate, totalAmount } = deliveryData;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px 10px 0; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Order Delivered!</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          
          <div class="success-box">
            <h3 style="margin-top: 0; color: #28a745;">🎉 Your order has been successfully delivered!</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
            <p><strong>Order Value:</strong> ₹${totalAmount.toFixed(2)}</p>
          </div>
          
          <p>We hope you're satisfied with your purchase. Your feedback helps us serve you better!</p>
          
          <p>
            <a href="${process.env.FRONTEND_URL}/WriteReview.html?orderid=${orderNumber}" class="button">Write a Review</a>
            <a href="${process.env.FRONTEND_URL}/Dashboard.html" class="button" style="background: #666;">View Orders</a>
          </p>
          
          <p style="background: #e7f3ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px;">
            <strong>Need Help?</strong> If there are any issues with your order, please contact our support team within 7 days.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2026 Sai Scientifics. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Sai Scientifics <sales@saiscientifics.com>',
      to: email,
      subject: `Order Delivered - ${orderNumber}`,
      html
    });
    
    logger.info(`Delivery notification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send delivery notification: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send grievance/support response
 */
async function sendGrievanceResponse(email, grievanceData) {
  const { grievanceId, customerName, subject, response, statusColor = '#667eea' } = grievanceData;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, ${statusColor} 0%, #667eea 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .response-box { background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>We've Responded to Your Concern</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          
          <p>Thank you for reaching out. We have reviewed your concern and provided a response below.</p>
          
          <div class="response-box">
            <h4 style="margin-top: 0; color: ${statusColor};">${subject}</h4>
            <p><strong>Ticket ID:</strong> ${grievanceId}</p>
            <hr>
            <p>${response}</p>
          </div>
          
          <p>If you have any further questions, please don't hesitate to contact us.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/Grievance.html" style="color: ${statusColor}; text-decoration: none; font-weight: bold;">View Your Grievances</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2026 Sai Scientifics. All rights reserved.<br>support@saiscientifics.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Sai Scientifics <sales@saiscientifics.com>',
      to: email,
      subject: `Re: ${subject}`,
      html
    });
    
    logger.info(`Grievance response email sent to ${email}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send grievance response: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send promotional email
 */
async function sendPromotion(email, promoData) {
  const { customerName, promoTitle, promoDescription, discountCode, discountPercent, expiryDate } = promoData;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .promo-box { background: linear-gradient(135deg, #fff5e1 0%, #ffe0b2 100%); padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .discount-badge { font-size: 48px; font-weight: bold; color: #ff6b6b; margin: 10px 0; }
        .code-box { background: white; border: 3px dashed #ff6b6b; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 15px 0; border-radius: 6px; font-family: monospace; }
        .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ${promoTitle}</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          
          <p>${promoDescription}</p>
          
          <div class="promo-box">
            <p style="margin-top: 0; font-size: 16px; color: #666;">Get</p>
            <div class="discount-badge">${discountPercent}% OFF</div>
            <p style="margin-bottom: 0; font-size: 14px; color: #666;">on your next purchase!</p>
            
            <p style="margin: 15px 0; font-size: 14px; color: #999;">Use coupon code:</p>
            <div class="code-box">${discountCode}</div>
            
            <p style="margin-bottom: 0; font-size: 12px; color: #999;">Valid until ${expiryDate}</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/" class="button">Shop Now</a>
          </p>
          
          <p style="background: #f0f0f0; padding: 15px; border-radius: 6px; font-size: 12px;">
            This offer is exclusively for you. Code is valid for one-time use only. 
            Terms and conditions apply.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2026 Sai Scientifics. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Sai Scientifics <sales@saiscientifics.com>',
      to: email,
      subject: promoTitle,
      html
    });
    
    logger.info(`Promotional email sent to ${email}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send promotional email: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send invoice email with PDF attachment
 */
async function sendInvoiceEmail(email, invoiceData) {
  const { customerName, orderNumber, totalAmount, invoicePath } = invoiceData;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .invoice-box { background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px 10px 0; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Invoice Ready</h1>
          <p>Your order invoice is attached</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${customerName}</strong>,</p>
          
          <p>Thank you for your order! Your invoice is ready and attached to this email.</p>
          
          <div class="invoice-box">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
            <p><strong>Invoice Status:</strong> <span style="color: #28a745; font-weight: bold;">PAID</span></p>
          </div>
          
          <p>The invoice PDF is attached to this email. You can also download it from your order history on our website.</p>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <p>Best regards,<br><strong>Sai Scientifics Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2026 Sai Scientifics. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Sai Scientifics <sales@saiscientifics.com>',
      to: email,
      subject: `Invoice for Order ${orderNumber}`,
      html,
      attachments: [
        {
          filename: `invoice-${orderNumber}.pdf`,
          path: invoicePath
        }
      ]
    };
    
    await transporter.sendMail(mailOptions);
    
    logger.info(`Invoice email sent to ${email} for order ${orderNumber}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send invoice email: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test email connection
 */
async function testConnection() {
  try {
    await transporter.verify();
    logger.info('Email service connected successfully');
    return { success: true, message: 'Email service is operational' };
  } catch (error) {
    logger.error(`Email service connection failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOrderConfirmation,
  sendShipmentNotification,
  sendDeliveryNotification,
  sendGrievanceResponse,
  sendPromotion,
  sendInvoiceEmail,
  testConnection,
  transporter
};
