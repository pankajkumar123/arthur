/**
 * OrderConfirmation.js - Handle order confirmation display
 * Fetches order details and shows them with invoice
 */

class OrderConfirmationManager {
  constructor() {
    this.order = null;
    this.orderId = null;
    this.init();
  }

  async init() {
    const params = new URLSearchParams(window.location.search);
    this.orderId = params.get('orderId');
    const paymentId = params.get('paymentId');

    if (!this.orderId) {
      window.location.href = 'Cart.html';
      return;
    }

    console.log('Loading order confirmation:', { orderId: this.orderId, paymentId });
    await this.loadOrderData();
  }

  async loadOrderData() {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        window.location.href = 'Login.html';
        return;
      }

      const response = await fetch(`${window.API_BASE}/orders/${this.orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to load order details');
      }

      this.order = await response.json();
      console.log('Order loaded:', this.order);
      this.displayOrder();

      // Clear cart after successful order
      this.clearCart();

      // Track order confirmation event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
          transaction_id: this.order.id,
          value: this.order.total_amount,
          currency: 'INR',
          items: this.order.items.map(item => ({
            item_id: item.product_id,
            item_name: item.product_name,
            price: item.unit_price,
            quantity: item.quantity
          }))
        });
      }

    } catch (error) {
      console.error('Error loading order:', error);
      document.body.innerHTML += `
        <div style="text-align: center; padding: 40px;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ef4444;"></i>
          <h2>Error Loading Order</h2>
          <p>${error.message}</p>
          <a href="Cart.html" style="background: #ff6b00; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Back to Cart</a>
        </div>
      `;
    }
  }

  displayOrder() {
    if (!this.order) return;

    // Order number
    document.getElementById('orderNumber').textContent = `Order #${this.order.order_number}`;
    document.getElementById('confirmedTime').textContent = new Date(this.order.created_at).toLocaleString('en-IN');

    // Order details grid
    this.displayOrderDetails();

    // Address details grid
    this.displayAddressDetails();

    // Invoice table
    this.displayInvoiceTable();

    // Summary
    this.displaySummary();
  }

  displayOrderDetails() {
    const grid = document.getElementById('orderDetailsGrid');
    grid.innerHTML = `
      <div class="info-item">
        <div class="info-label">Order Number</div>
        <div class="info-value">${this.order.order_number}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Order Date</div>
        <div class="info-value">${new Date(this.order.created_at).toLocaleDateString('en-IN')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Total Amount</div>
        <div class="info-value">₹${this.order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Payment Status</div>
        <div class="info-value">
          <span class="status-badge status-${this.getStatusClass(this.order.payment_status)}">
            ${this.order.payment_status || 'Pending'}
          </span>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Order Status</div>
        <div class="info-value">
          <span class="status-badge status-${this.getStatusClass(this.order.status)}">
            ${this.order.status || 'Confirmed'}
          </span>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Expected Delivery</div>
        <div class="info-value">
          ${this.getExpectedDeliveryDate()}
        </div>
      </div>
    `;
  }

  displayAddressDetails() {
    const grid = document.getElementById('addressDetailsGrid');
    grid.innerHTML = `
      <div class="info-item">
        <div class="info-label">Recipient Name</div>
        <div class="info-value">${this.order.customer_name || 'Not provided'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Phone Number</div>
        <div class="info-value">${this.order.customer_phone || 'Not provided'}</div>
      </div>
      <div class="info-item" style="grid-column: 1 / -1;">
        <div class="info-label">Address</div>
        <div class="info-value">
          ${this.order.delivery_address}<br>
          ${this.order.city}, ${this.order.state} - ${this.order.pincode}
        </div>
      </div>
    `;
  }

  displayInvoiceTable() {
    const tbody = document.getElementById('invoiceTableBody');
    tbody.innerHTML = '';

    if (this.order.items && this.order.items.length > 0) {
      this.order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <div class="product-cell">
              <div>
                <div class="product-name">${item.product_name || 'Product'}</div>
                <div class="product-sku">SKU: ${item.product_sku || 'N/A'}</div>
              </div>
            </div>
          </td>
          <td style="text-align: center;">${item.quantity}</td>
          <td class="price-cell">₹${item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td class="price-cell">₹${(item.unit_price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        `;
        tbody.appendChild(row);
      });
    }
  }

  displaySummary() {
    document.getElementById('summarySubtotal').textContent = `₹${this.order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('summaryGST').textContent = `₹${this.order.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('summaryShipping').textContent = this.order.shipping_cost === 0 
      ? '<span style="color: #10b981;">FREE</span>' 
      : `₹${this.order.shipping_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('summaryTotal').textContent = `₹${this.order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  getStatusClass(status) {
    const classMap = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'processing': 'processing',
      'shipped': 'processing',
      'delivered': 'confirmed'
    };
    return classMap[status?.toLowerCase()] || 'pending';
  }

  getExpectedDeliveryDate() {
    // Calculate expected delivery (3-5 business days)
    const date = new Date(this.order.created_at);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-IN');
  }

  async clearCart() {
    try {
      const token = localStorage.getItem('customerToken');
      await fetch(`${window.API_BASE}/cart/clear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.removeItem('cartCount');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }
}

// Global functions for invoice actions
async function downloadInvoice() {
  try {
    const orderId = new URLSearchParams(window.location.search).get('orderId');
    const token = localStorage.getItem('customerToken');

    const response = await fetch(`${window.API_BASE}/orders/${orderId}/invoice/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      alert('Failed to download invoice');
    }
  } catch (error) {
    console.error('Error downloading invoice:', error);
    alert('Error downloading invoice');
  }
}

async function sendInvoiceEmail() {
  try {
    const orderId = new URLSearchParams(window.location.search).get('orderId');
    const token = localStorage.getItem('customerToken');

    const response = await fetch(`${window.API_BASE}/orders/${orderId}/invoice/email`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      alert('Invoice sent to your email successfully!');
    } else {
      alert('Failed to send invoice');
    }
  } catch (error) {
    console.error('Error sending invoice:', error);
    alert('Error sending invoice');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.confirmationManager = new OrderConfirmationManager();
});
