/**
 * PDF Invoice Generation Service
 * Generates professional PDF invoices using PDFKit
 * 
 * Setup Required:
 * npm install pdfkit
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Generate PDF Invoice
 * @param {object} invoiceData - Invoice information
 * @returns {stream} - PDF stream
 */
function generateInvoicePDF(invoiceData) {
  const {
    invoiceNumber,
    invoiceDate,
    orderId,
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    gstRate = 18,
    gstAmount,
    shippingCharges = 0,
    totalAmount,
    transactionId,
    paymentMethod,
    paymentStatus,
    orderStatus,
    terms = 'Payment due upon receipt',
    notes = 'Thank you for your business!'
  } = invoiceData;

  const doc = new PDFDocument({ bufferPages: true });
  const stream = doc.pipe(fs.createWriteStream(path.join(__dirname, `../../uploads/invoice-${orderId}.pdf`)));

  // Colors
  const primaryColor = '#667eea';
  const secondaryColor = '#764ba2';
  const lightGray = '#f5f5f5';

  // Header Section
  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .text('INVOICE', 50, 50);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text('Sai Scientifics', 400, 50)
    .text('Industrial Area, Gurgaon', 400, 68)
    .text('Haryana 122003, India', 400, 86)
    .text('Phone: +91-9182-755-68', 400, 104)
    .text('Email: sales@saiscientifics.com', 400, 122);

  // Invoice Details Box
  doc
    .rect(50, 170, 500, 100)
    .fillAndStroke('#f0f0f0', '#ddd');

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('INVOICE DETAILS', 60, 180);

  doc
    .fontSize(9)
    .font('Helvetica')
    .text(`Invoice Number: ${invoiceNumber}`, 60, 205)
    .text(`Invoice Date: ${invoiceDate}`, 60, 222)
    .text(`Order Number: ${orderNumber}`, 60, 239)
    .text(`Order ID: ${orderId}`, 60, 256);

  // Payment Status Badge
  const statusColor = paymentStatus === 'success' ? '#28a745' : '#ffc107';
  doc
    .rect(350, 205, 150, 40)
    .fillAndStroke(statusColor, statusColor);

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('white')
    .text(paymentStatus.toUpperCase(), 360, 215);

  // Reset color
  doc.fillColor('black');

  // Bill To Section
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('BILL TO:', 50, 300);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(customerName, 50, 325)
    .text(customerAddress, 50, 345)
    .text(`Phone: ${customerPhone}`, 50, 365)
    .text(`Email: ${customerEmail}`, 50, 382);

  // Items Table
  const tableTop = 420;
  const tableLeft = 50;
  const colWidths = {
    item: 250,
    qty: 70,
    rate: 80,
    amount: 100
  };

  // Table Header
  doc
    .rect(tableLeft, tableTop, 500, 25)
    .fillAndStroke('#667eea', '#667eea');

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('white')
    .text('DESCRIPTION', tableLeft + 10, tableTop + 7)
    .text('QTY', tableLeft + colWidths.item + 10, tableTop + 7)
    .text('RATE', tableLeft + colWidths.item + colWidths.qty + 10, tableTop + 7)
    .text('AMOUNT', tableLeft + colWidths.item + colWidths.qty + colWidths.rate + 10, tableTop + 7);

  doc.fillColor('black');

  // Table Rows
  let yPosition = tableTop + 30;
  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    
    // Alternate row background
    if (isEven) {
      doc.rect(tableLeft, yPosition - 5, 500, 25).fill('#f9f9f9');
    }

    doc
      .fontSize(9)
      .font('Helvetica')
      .text(item.productName, tableLeft + 10, yPosition)
      .text(item.quantity.toString(), tableLeft + colWidths.item + 10, yPosition)
      .text(`₹${item.unitPrice.toFixed(2)}`, tableLeft + colWidths.item + colWidths.qty + 10, yPosition)
      .text(`₹${item.lineTotal.toFixed(2)}`, tableLeft + colWidths.item + colWidths.qty + colWidths.rate + 10, yPosition);

    yPosition += 25;
  });

  // Summary Section
  const summaryLeft = tableLeft + 350;
  yPosition += 20;

  // Subtotal
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Subtotal:', summaryLeft, yPosition)
    .text(`₹${subtotal.toFixed(2)}`, summaryLeft + 120, yPosition);

  yPosition += 25;

  // GST
  doc
    .text(`GST (${gstRate}%):`, summaryLeft, yPosition)
    .text(`₹${gstAmount.toFixed(2)}`, summaryLeft + 120, yPosition);

  yPosition += 25;

  // Shipping
  doc
    .text('Shipping:', summaryLeft, yPosition)
    .text(`₹${shippingCharges.toFixed(2)}`, summaryLeft + 120, yPosition);

  yPosition += 30;

  // Total
  doc
    .rect(summaryLeft, yPosition - 10, 150, 35)
    .fillAndStroke('#667eea', '#667eea');

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('white')
    .text('TOTAL:', summaryLeft + 10, yPosition - 5)
    .text(`₹${totalAmount.toFixed(2)}`, summaryLeft + 80, yPosition - 5);

  doc.fillColor('black');

  // Payment Details
  yPosition += 60;
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('PAYMENT DETAILS:', 50, yPosition);

  yPosition += 20;
  doc
    .fontSize(9)
    .font('Helvetica')
    .text(`Transaction ID: ${transactionId}`, 50, yPosition)
    .text(`Payment Method: ${paymentMethod}`, 50, yPosition + 20)
    .text(`Payment Status: ${paymentStatus}`, 50, yPosition + 40)
    .text(`Order Status: ${orderStatus}`, 50, yPosition + 60);

  // Terms & Conditions
  yPosition += 100;
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('TERMS & CONDITIONS:', 50, yPosition);

  doc
    .fontSize(8)
    .font('Helvetica')
    .text(terms, 50, yPosition + 20, { width: 500, align: 'left' });

  // Notes
  yPosition += 50;
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('NOTES:', 50, yPosition);

  doc
    .fontSize(8)
    .font('Helvetica')
    .text(notes, 50, yPosition + 20, { width: 500, align: 'left' });

  // Footer
  const footerY = doc.page.height - 60;
  doc
    .fontSize(8)
    .font('Helvetica')
    .text('This is a computer-generated invoice. No signature is required.', 50, footerY)
    .text('For support, visit https://saiscientifics.com or call +91-9182-755-68', 50, footerY + 20);

  doc.end();

  logger.info(`Invoice PDF generated for order ${orderId}`);
  return stream;
}

/**
 * Generate multiple invoices (batch)
 */
async function generateBatchInvoices(invoiceDataArray) {
  const results = [];

  for (const invoiceData of invoiceDataArray) {
    try {
      const stream = generateInvoicePDF(invoiceData);
      results.push({
        success: true,
        orderId: invoiceData.orderId,
        fileName: `invoice-${invoiceData.orderId}.pdf`
      });
    } catch (error) {
      logger.error(`Failed to generate invoice for order ${invoiceData.orderId}: ${error.message}`);
      results.push({
        success: false,
        orderId: invoiceData.orderId,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Get invoice file path
 */
function getInvoicePath(orderId) {
  return path.join(__dirname, `../../uploads/invoice-${orderId}.pdf`);
}

/**
 * Check if invoice exists
 */
function invoiceExists(orderId) {
  const filePath = getInvoicePath(orderId);
  return fs.existsSync(filePath);
}

/**
 * Delete invoice file
 */
function deleteInvoice(orderId) {
  try {
    const filePath = getInvoicePath(orderId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Invoice deleted for order ${orderId}`);
      return { success: true };
    }
    return { success: false, error: 'Invoice not found' };
  } catch (error) {
    logger.error(`Failed to delete invoice: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Generate invoice with stream response (for direct download)
 */
function generateInvoiceStream(invoiceData) {
  const doc = new PDFDocument({ bufferPages: true });

  // All the same PDF generation code from generateInvoicePDF
  // but returns the doc stream directly instead of writing to file
  
  const {
    invoiceNumber,
    invoiceDate,
    orderId,
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    gstRate = 18,
    gstAmount,
    shippingCharges = 0,
    totalAmount,
    transactionId,
    paymentMethod,
    paymentStatus,
    orderStatus
  } = invoiceData;

  // Header
  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .text('INVOICE', 50, 50);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text('Sai Scientifics', 400, 50)
    .text('Industrial Area, Gurgaon', 400, 68)
    .text('Haryana 122003, India', 400, 86);

  // Quick version - core details only
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Invoice: ${invoiceNumber}`, 50, 150)
    .text(`Order: ${orderNumber}`, 50, 170)
    .text(`Date: ${invoiceDate}`, 50, 190);

  doc
    .text(`Bill To: ${customerName}`, 50, 230)
    .text(customerAddress, 50, 250);

  // Items table (simplified)
  let yPos = 300;
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Item', 50, yPos)
    .text('Qty', 300, yPos)
    .text('Rate', 350, yPos)
    .text('Amount', 420, yPos);

  yPos += 20;
  items.forEach(item => {
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(item.productName.substring(0, 40), 50, yPos)
      .text(item.quantity, 300, yPos)
      .text(`₹${item.unitPrice}`, 350, yPos)
      .text(`₹${item.lineTotal.toFixed(2)}`, 420, yPos);
    yPos += 20;
  });

  yPos += 20;
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(`Total: ₹${totalAmount.toFixed(2)}`, 400, yPos);

  return doc;
}

module.exports = {
  generateInvoicePDF,
  generateBatchInvoices,
  getInvoicePath,
  invoiceExists,
  deleteInvoice,
  generateInvoiceStream
};
