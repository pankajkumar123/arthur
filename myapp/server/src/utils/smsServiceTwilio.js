/**
 * SMS & WhatsApp Notification Service
 * Sends SMS via Twilio and WhatsApp messages using Twilio API
 * 
 * Setup Required:
 * 1. Create Twilio account: https://www.twilio.com/
 * 2. Add to .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_FROM, TWILIO_WHATSAPP_FROM
 */

const logger = require('./logger');

// Twilio client - optional, only loaded if credentials exist
let twilioClient = null;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  logger.warn('Twilio not configured. SMS/WhatsApp notifications disabled.');
}

/**
 * Send SMS notification
 * @param {string} phone - Phone number in E.164 format (+919876543210)
 * @param {string} message - SMS message content (max 160 chars, or 1600 for long)
 * @returns {object} - { success, messageId, error }
 */
async function sendSMS(phone, message) {
  if (!twilioClient) {
    logger.warn('Twilio not configured. SMS not sent.');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_FROM || '+1234567890',
      to: phone
    });

    logger.info(`SMS sent to ${phone}. Message ID: ${result.sid}`);
    return { 
      success: true, 
      messageId: result.sid,
      status: result.status 
    };
  } catch (error) {
    logger.error(`Failed to send SMS to ${phone}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp message
 * @param {string} phone - Phone number in E.164 format (+919876543210)
 * @param {string} message - Message text
 * @param {object} mediaUrls - Optional: { images: [], documents: [] }
 * @returns {object} - { success, messageId, error }
 */
async function sendWhatsApp(phone, message, mediaUrls = null) {
  if (!twilioClient) {
    logger.warn('Twilio not configured. WhatsApp message not sent.');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const messageParams = {
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${phone}`
    };

    // Add media if provided
    if (mediaUrls) {
      if (mediaUrls.images && mediaUrls.images.length > 0) {
        messageParams.mediaUrl = mediaUrls.images;
      }
    }

    const result = await twilioClient.messages.create(messageParams);

    logger.info(`WhatsApp message sent to ${phone}. Message ID: ${result.sid}`);
    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  } catch (error) {
    logger.error(`Failed to send WhatsApp to ${phone}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send order confirmation via SMS
 */
async function sendOrderConfirmationSMS(phone, orderData) {
  const { orderNumber, totalAmount, estimatedDelivery } = orderData;
  
  const message = `Hi! Your order ${orderNumber} of ₹${totalAmount} is confirmed. Expected delivery: ${estimatedDelivery}. View status: https://saiscientifics.com`;
  
  return sendSMS(phone, message);
}

/**
 * Send shipment tracking via SMS
 */
async function sendShipmentTrackingSMS(phone, trackingData) {
  const { orderNumber, trackingNumber, courierName } = trackingData;
  
  const message = `Good news! Your order ${orderNumber} is dispatched. Track with ${courierName}: ${trackingNumber}`;
  
  return sendSMS(phone, message);
}

/**
 * Send delivery confirmation via SMS
 */
async function sendDeliveryConfirmationSMS(phone, orderNumber) {
  const message = `Your order ${orderNumber} has been delivered! Please review the product and let us know your experience.`;
  
  return sendSMS(phone, message);
}

/**
 * Send OTP via SMS (for features like password reset)
 */
async function sendOTPSMS(phone, otp, expiryMinutes = 5) {
  const message = `Your Sai Scientifics OTP is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share with anyone.`;
  
  return sendSMS(phone, message);
}

/**
 * Send payment reminder via SMS (for pending payments)
 */
async function sendPaymentReminderSMS(phone, reminderData) {
  const { orderNumber, totalAmount, paymentLink } = reminderData;
  
  const message = `Reminder: Your order ${orderNumber} is pending payment of ₹${totalAmount}. Complete payment: ${paymentLink}`;
  
  return sendSMS(phone, message);
}

/**
 * Send order cancellation notification via SMS
 */
async function sendCancellationSMS(phone, cancellationData) {
  const { orderNumber, refundAmount, reason } = cancellationData;
  
  const message = `Your order ${orderNumber} has been cancelled. Refund of ₹${refundAmount} will be processed. Reason: ${reason}`;
  
  return sendSMS(phone, message);
}

/**
 * Send WhatsApp order update
 */
async function sendWhatsAppOrderUpdate(phone, orderData) {
  const { orderNumber, status, message: customMessage } = orderData;
  
  let message = `Order ${orderNumber}: ${customMessage}`;
  
  if (status === 'confirmed') {
    message = `Thank you! Your order *${orderNumber}* is confirmed. We'll keep you updated on the status.`;
  } else if (status === 'dispatched') {
    message = `Good news! Your order *${orderNumber}* is on the way. You'll receive tracking details shortly.`;
  } else if (status === 'delivered') {
    message = `Your order *${orderNumber}* has been delivered! Please confirm receipt and share your feedback.`;
  }
  
  return sendWhatsApp(phone, message);
}

/**
 * Send promotional offer via WhatsApp
 */
async function sendWhatsAppPromotion(phone, promoData) {
  const { promoTitle, discountPercent, discountCode, validTill } = promoData;
  
  const message = `🎉 *Exclusive Offer* 🎉\n\n${promoTitle}\n\nGet *${discountPercent}% OFF*\n\nCode: *${discountCode}*\nValid till: ${validTill}\n\n[Shop Now](https://saiscientifics.com)`;
  
  return sendWhatsApp(phone, message);
}

/**
 * Send support ticket acknowledgment via WhatsApp
 */
async function sendSupportTicketWhatsApp(phone, ticketData) {
  const { ticketId, issueType, expectedResolution } = ticketData;
  
  const message = `Thank you for contacting Sai Scientifics!\n\nTicket ID: *${ticketId}*\nIssue: ${issueType}\nExpected Resolution: ${expectedResolution}\n\nWe'll get back to you soon.`;
  
  return sendWhatsApp(phone, message);
}

/**
 * Bulk SMS send (with rate limiting)
 */
async function sendBulkSMS(recipients, message, delayMs = 100) {
  const results = [];
  
  for (const phone of recipients) {
    const result = await sendSMS(phone, message);
    results.push({ phone, ...result });
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  logger.info(`Bulk SMS sent to ${recipients.length} recipients`);
  return results;
}

/**
 * Check SMS delivery status
 */
async function checkMessageStatus(messageId) {
  if (!twilioClient) {
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const message = await twilioClient.messages(messageId).fetch();
    return {
      success: true,
      messageId,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    };
  } catch (error) {
    logger.error(`Failed to check message status: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test Twilio connection
 */
async function testTwilioConnection() {
  if (!twilioClient) {
    return { available: false, message: 'Twilio not configured' };
  }

  try {
    const account = await twilioClient.api.accounts.list({ limit: 1 });
    if (account.length > 0) {
      return {
        available: true,
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        phoneFrom: process.env.TWILIO_PHONE_FROM,
        whatsappFrom: process.env.TWILIO_WHATSAPP_FROM
      };
    }
  } catch (error) {
    logger.error(`Twilio connection test failed: ${error.message}`);
    return { available: false, error: error.message };
  }
}

module.exports = {
  sendSMS,
  sendWhatsApp,
  sendOrderConfirmationSMS,
  sendShipmentTrackingSMS,
  sendDeliveryConfirmationSMS,
  sendOTPSMS,
  sendPaymentReminderSMS,
  sendCancellationSMS,
  sendWhatsAppOrderUpdate,
  sendWhatsAppPromotion,
  sendSupportTicketWhatsApp,
  sendBulkSMS,
  checkMessageStatus,
  testTwilioConnection
};
