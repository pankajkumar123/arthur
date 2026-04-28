/**
 * Checkout.js - E-commerce Checkout Flow
 * Handles order creation, validation, and payment initiation
 */

class CheckoutManager {
  constructor() {
    this.order = null;
    this.cartItems = [];
    this.totals = {
      subtotal: 0,
      gst: 0,
      shipping: 0,
      discount: 0,
      total: 0
    };
    this.init();
  }

  async init() {
    console.log('Initializing Checkout Manager...');
    this.setupEventListeners();
    await this.loadCartData();
    this.updateUI();
  }

  setupEventListeners() {
    // Payment method selection
    document.querySelectorAll('[data-method]').forEach(label => {
      label.addEventListener('click', () => {
        document.querySelectorAll('[data-method]').forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
        document.querySelector(`input[value="${label.dataset.method}"]`).checked = true;
      });
    });

    // Proceed to payment button
    document.getElementById('proceedBtn').addEventListener('click', () => this.proceedToPayment());

    // Form validation
    const form = document.querySelectorAll('input[required], select[required]');
    form.forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          this.validateField(field);
        }
      });
    });

    // Real-time validation for pincode
    document.getElementById('pincode').addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
      this.checkShippingEligibility();
    });

    // Shipping calculation trigger
    document.getElementById('state').addEventListener('change', () => this.updateShipping());
  }

  async loadCartData() {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        window.location.href = 'Login.html';
        return;
      }

      // Get user data to pre-fill form
      const response = await fetch(`${window.API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        this.prefillUserData(user);
      }

      // Load cart items
      const cartResponse = await fetch(`${window.API_BASE}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (cartResponse.ok) {
        const cart = await cartResponse.json();
        this.cartItems = cart.items || [];
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      this.showError('Failed to load checkout data. Please refresh the page.');
    }
  }

  prefillUserData(user) {
    if (user.full_name) document.getElementById('fullName').value = user.full_name;
    if (user.email) document.getElementById('email').value = user.email;
    if (user.phone) document.getElementById('phone').value = user.phone;
    if (user.city) document.getElementById('city').value = user.city;
    if (user.state) document.getElementById('state').value = user.state;
    if (user.pincode) document.getElementById('pincode').value = user.pincode;
    if (user.address) document.getElementById('addressLine').value = user.address;
  }

  updateUI() {
    this.renderCartItems();
    this.calculateTotals();
    this.updateShipping();
  }

  renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = '';

    if (this.cartItems.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #6b7280;">
          <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 8px;"></i>
          <p>Your cart is empty</p>
          <a href="Products.html" style="color: #ff6b00; text-decoration: none; font-weight: 500;">Continue Shopping</a>
        </div>
      `;
      document.getElementById('proceedBtn').disabled = true;
      return;
    }

    this.cartItems.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-qty">Qty: <strong>${item.quantity}</strong></div>
        </div>
        <div class="item-price">₹${(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
      `;
      container.appendChild(itemEl);
    });
  }

  calculateTotals() {
    this.totals.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.totals.gst = Math.round(this.totals.subtotal * 0.18 * 100) / 100;
    this.totals.discount = 0; // Add discount logic if needed

    // Update UI
    document.getElementById('subtotal').textContent = `₹${this.totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('gst').textContent = `₹${this.totals.gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('discount').textContent = `₹${this.totals.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    this.updateTotal();
  }

  checkShippingEligibility() {
    const pincode = document.getElementById('pincode').value;
    if (pincode.length === 6) {
      // In real implementation, call API to check serviceable pincode
      console.log('Checking pincode:', pincode);
    }
  }

  updateShipping() {
    // Free shipping on orders > ₹5000
    this.totals.shipping = this.totals.subtotal > 5000 ? 0 : 100;
    
    const shippingAmount = document.getElementById('shippingAmount');
    const shippingFree = document.getElementById('shippingFree');
    
    if (this.totals.shipping === 0) {
      shippingAmount.style.display = 'none';
      shippingFree.style.display = 'inline';
    } else {
      shippingAmount.style.display = 'inline';
      shippingAmount.textContent = `₹${this.totals.shipping}`;
      shippingFree.style.display = 'none';
    }
    
    this.updateTotal();
  }

  updateTotal() {
    this.totals.total = this.totals.subtotal + this.totals.gst + this.totals.shipping - this.totals.discount;
    document.getElementById('totalAmount').textContent = `₹${this.totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  validateField(field) {
    let isValid = true;
    let errorMsg = '';

    const validators = {
      fullName: (val) => {
        isValid = val.trim().length >= 3;
        return isValid ? '' : 'Full name must be at least 3 characters';
      },
      email: (val) => {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        return isValid ? '' : 'Please enter a valid email address';
      },
      phone: (val) => {
        isValid = /^[0-9]{10}$/.test(val);
        return isValid ? '' : 'Phone number must be 10 digits';
      },
      addressLine: (val) => {
        isValid = val.trim().length >= 5;
        return isValid ? '' : 'Please enter a valid address';
      },
      city: (val) => {
        isValid = val.trim().length >= 2;
        return isValid ? '' : 'Please enter a valid city';
      },
      state: (val) => {
        isValid = val.trim() !== '';
        return isValid ? '' : 'Please select a state';
      },
      pincode: (val) => {
        isValid = /^[0-9]{6}$/.test(val);
        return isValid ? '' : 'Pincode must be 6 digits';
      }
    };

    const validator = validators[field.id];
    if (validator) {
      errorMsg = validator(field.value);
      isValid = !errorMsg;
    }

    // Update UI
    const errorEl = document.getElementById(`${field.id}Error`);
    if (errorEl) {
      errorEl.textContent = errorMsg;
      if (isValid) {
        field.classList.remove('error');
      } else {
        field.classList.add('error');
      }
    }

    return isValid;
  }

  validateForm() {
    const fields = ['fullName', 'email', 'phone', 'addressLine', 'city', 'state', 'pincode'];
    let allValid = true;

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!this.validateField(field)) {
        allValid = false;
      }
    });

    return allValid;
  }

  getFormData() {
    return {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      addressLine: document.getElementById('addressLine').value.trim(),
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value.trim(),
      pincode: document.getElementById('pincode').value.trim(),
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
    };
  }

  async proceedToPayment() {
    // Validate form
    if (!this.validateForm()) {
      this.showError('Please correct errors in the form');
      return;
    }

    const btn = document.getElementById('proceedBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="loading-spinner"></div> <span>Processing...</span>';

    try {
      const token = localStorage.getItem('customerToken');
      const formData = this.getFormData();

      // Create order
      const orderResponse = await fetch(`${window.API_BASE}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressLine: formData.addressLine,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          paymentMethod: formData.paymentMethod
        })
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      this.order = orderData;

      console.log('Order created:', this.order);

      // Track event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
          value: this.totals.total,
          currency: 'INR',
          items: this.cartItems.map(item => ({
            item_name: item.name,
            item_id: item.product_id,
            price: item.price,
            quantity: item.quantity
          }))
        });
      }

      // Proceed based on payment method
      if (formData.paymentMethod === 'razorpay') {
        this.initializeRazorpay(orderData, formData);
      } else if (formData.paymentMethod === 'credit') {
        this.processCreditPayment(orderData, formData);
      }

    } catch (error) {
      console.error('Error during checkout:', error);
      this.showError(error.message || 'An error occurred during checkout');
      btn.disabled = false;
      btn.innerHTML = '<span>Proceed to Payment</span>';
    }
  }

  async initializeRazorpay(orderData, formData) {
    try {
      const token = localStorage.getItem('customerToken');

      // Create Razorpay payment order
      const paymentResponse = await fetch(`${window.API_BASE}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: orderData.id })
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const paymentData = await paymentResponse.json();

      // Initialize Razorpay
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.razorpayOrderId,
        customer_id: formData.email,
        name: 'Sai Scientifics',
        description: `Order ${orderData.order_number}`,
        image: 'https://saiscientifics.com/logo.png',
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          order_number: orderData.order_number,
          customer_id: orderData.customer_id
        },
        handler: (response) => this.handlePaymentSuccess(response, orderData.id),
        modal: {
          ondismiss: () => this.handlePaymentCancelled()
        },
        theme: {
          color: '#ff6b00'
        }
      };

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const razorpay = new Razorpay(options);
          razorpay.open();
        };
        script.onerror = () => this.showError('Failed to load payment gateway');
        document.head.appendChild(script);
      } else {
        const razorpay = new Razorpay(options);
        razorpay.open();
      }

    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      this.showError(error.message || 'Failed to initialize payment gateway');
      document.getElementById('proceedBtn').disabled = false;
      document.getElementById('proceedBtn').innerHTML = '<span>Proceed to Payment</span>';
    }
  }

  async handlePaymentSuccess(response, orderId) {
    console.log('Payment successful:', response);

    try {
      const token = localStorage.getItem('customerToken');

      // Verify payment with backend
      const verifyResponse = await fetch(`${window.API_BASE}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
          orderId: orderId
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verifyData = await verifyResponse.json();

      // Track successful payment
      if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
          transaction_id: response.razorpay_payment_id,
          value: this.totals.total,
          currency: 'INR',
          items: this.cartItems.map(item => ({
            item_name: item.name,
            item_id: item.product_id,
            price: item.price,
            quantity: item.quantity
          }))
        });
      }

      // Redirect to success page
      window.location.href = `OrderConfirmation.html?orderId=${orderId}&paymentId=${response.razorpay_payment_id}`;

    } catch (error) {
      console.error('Error verifying payment:', error);
      this.showError('Payment verification failed. Please contact support.');
    }
  }

  handlePaymentCancelled() {
    this.showError('Payment cancelled. Please try again.');
    document.getElementById('proceedBtn').disabled = false;
    document.getElementById('proceedBtn').innerHTML = '<span>Proceed to Payment</span>';
  }

  async processCreditPayment(orderData, formData) {
    // Redirect to credit application flow
    window.location.href = `BuyOnCredit.html?orderId=${orderData.id}&amount=${this.totals.total}`;
  }

  showError(message) {
    const errorDiv = document.getElementById('addressError') || document.getElementById('paymentError');
    if (errorDiv) {
      errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      errorDiv.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert(message);
    }
  }

  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.querySelector('.checkout-container').insertBefore(successDiv, document.querySelector('.checkout-header'));
  }
}

// Initialize checkout on page load
document.addEventListener('DOMContentLoaded', () => {
  window.checkoutManager = new CheckoutManager();
});
