// Payment.js - Payment Gateway Integration

// Mock cart data (in production, load from localStorage or API)
let cartItems = [];
let selectedPaymentMethod = null;
let selectedBank = null;
let selectedWallet = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  const token = localStorage.getItem('customerToken');
  const userName = localStorage.getItem('customerName');
  
  if (!token || !userName) {
    window.location.href = 'Login.html';
    return;
  }

  // Initialize
  initializeUser(userName);
  loadCart();
  setupPaymentMethods();
  setupPayButton();
});

// Initialize User
function initializeUser(userName) {
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = userName;
  }

  const userSection = document.getElementById('userSection');
  const authSection = document.getElementById('authSection');
  if (userSection) userSection.style.display = 'block';
  if (authSection) authSection.style.display = 'none';
}

// Load Cart
function loadCart() {
  // In production, load from localStorage or API
  // For now, use mock data
  cartItems = getMockCartItems();
  
  if (cartItems.length === 0) {
    alert('Your cart is empty!');
    window.location.href = 'Cart.html';
    return;
  }

  renderOrderSummary();
}

// Get Mock Cart Items
function getMockCartItems() {
  // Check localStorage first
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    try {
      return JSON.parse(storedCart);
    } catch (e) {
      console.error('Error parsing cart:', e);
    }
  }

  // Return mock data if no cart exists
  return [
    {
      id: 1,
      name: '3M Safety Helmet with Face Shield',
      price: 2490,
      qty: 2,
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 2,
      name: 'Bosch Professional Power Drill Kit',
      price: 4480,
      qty: 1,
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 3,
      name: 'DeWalt Cordless Impact Driver Set',
      price: 3920,
      qty: 3,
      image: 'https://via.placeholder.com/60'
    }
  ];
}

// Render Order Summary
function renderOrderSummary() {
  const summaryItems = document.getElementById('summaryItems');
  
  if (!summaryItems) return;

  summaryItems.innerHTML = cartItems.map(item => `
    <div class="summary-item">
      <img src="${item.image}" alt="${item.name}" class="summary-item-image">
      <div class="summary-item-details">
        <div class="summary-item-name">${item.name}</div>
        <div class="summary-item-qty">Qty: ${item.qty}</div>
        <div class="summary-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
      </div>
    </div>
  `).join('');

  updatePriceSummary();
}

// Update Price Summary
function updatePriceSummary() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const gstAmount = Math.round(subtotal * 0.18);
  const shipping = 0; // Free shipping
  const discount = 0;
  const total = subtotal + gstAmount + shipping - discount;

  document.getElementById('itemCount').textContent = cartItems.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById('gst').textContent = `₹${gstAmount.toLocaleString()}`;
  document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`;
  document.getElementById('total').textContent = `₹${total.toLocaleString()}`;

  if (discount > 0) {
    document.getElementById('discountRow').style.display = 'flex';
    document.getElementById('discount').textContent = `-₹${discount.toLocaleString()}`;
  }
}

// Setup Payment Methods
function setupPaymentMethods() {
  const paymentMethods = document.querySelectorAll('.payment-method');
  const radioButtons = document.querySelectorAll('input[name="paymentMethod"]');

  paymentMethods.forEach((method, index) => {
    const radio = radioButtons[index];
    const label = method.querySelector('label');

    // Click on label to select
    label.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        radio.checked = true;
        updateSelectedMethod();
      }
    });

    // Radio change
    radio.addEventListener('change', updateSelectedMethod);
  });

  // UPI Apps
  document.querySelectorAll('.upi-app-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const app = btn.getAttribute('data-app');
      selectUPIApp(app);
    });
  });

  // Banks
  document.querySelectorAll('.bank-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const bank = btn.getAttribute('data-bank');
      selectBank(bank);
    });
  });

  // Wallets
  document.querySelectorAll('.wallet-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const wallet = btn.getAttribute('data-wallet');
      selectWallet(wallet);
    });
  });

  // Card number formatting
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }

  // Card expiry formatting
  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }

  // UPI ID verify button
  const verifyBtn = document.querySelector('.verify-btn');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', () => {
      const upiId = document.getElementById('upiId').value;
      if (upiId) {
        showNotification('UPI ID verified successfully!', 'success');
      } else {
        showNotification('Please enter a valid UPI ID', 'error');
      }
    });
  }

  // Change address button
  const changeBtn = document.querySelector('.change-btn');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      showNotification('Address change functionality would open address selector', 'success');
    });
  }
}

// Update Selected Method
function updateSelectedMethod() {
  const paymentMethods = document.querySelectorAll('.payment-method');
  const selectedRadio = document.querySelector('input[name="paymentMethod"]:checked');

  paymentMethods.forEach(method => method.classList.remove('selected'));

  if (selectedRadio) {
    const selectedMethod = selectedRadio.closest('.payment-method');
    selectedMethod.classList.add('selected');
    selectedPaymentMethod = selectedRadio.value;
    
    // Enable pay button
    const payBtn = document.getElementById('payBtn');
    payBtn.disabled = false;
    payBtn.innerHTML = `<i class="fas fa-lock"></i> Pay Now`;
  }
}

// Select UPI App
function selectUPIApp(app) {
  document.querySelectorAll('.upi-app-btn').forEach(btn => {
    btn.style.borderColor = btn.getAttribute('data-app') === app ? '#ff5a00' : '#e5e7eb';
    btn.style.background = btn.getAttribute('data-app') === app ? '#f6f2ed' : 'white';
  });
  showNotification(`Selected ${app.toUpperCase()}`, 'success');
}

// Select Bank
function selectBank(bank) {
  document.querySelectorAll('.bank-btn').forEach(btn => {
    btn.style.borderColor = btn.getAttribute('data-bank') === bank ? '#ff5a00' : '#e5e7eb';
    btn.style.background = btn.getAttribute('data-bank') === bank ? '#f6f2ed' : 'white';
  });
  selectedBank = bank;
  showNotification(`Selected ${bank.toUpperCase()} Bank`, 'success');
}

// Select Wallet
function selectWallet(wallet) {
  document.querySelectorAll('.wallet-btn').forEach(btn => {
    btn.style.borderColor = btn.getAttribute('data-wallet') === wallet ? '#ff5a00' : '#e5e7eb';
    btn.style.background = btn.getAttribute('data-wallet') === wallet ? '#f6f2ed' : 'white';
  });
  selectedWallet = wallet;
  showNotification(`Selected ${wallet.charAt(0).toUpperCase() + wallet.slice(1)} Wallet`, 'success');
}

// Setup Pay Button
function setupPayButton() {
  const payBtn = document.getElementById('payBtn');
  
  if (!payBtn) return;

  payBtn.addEventListener('click', () => {
    if (!selectedPaymentMethod) {
      showNotification('Please select a payment method', 'error');
      return;
    }

    processPayment();
  });
}

// Process Payment
function processPayment() {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const gstAmount = Math.round(total * 0.18);
  const finalAmount = total + gstAmount;

  // Show loading state
  const payBtn = document.getElementById('payBtn');
  payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  payBtn.disabled = true;

  // Simulate payment processing
  setTimeout(() => {
    // Validate payment method specific requirements
    if (selectedPaymentMethod === 'card') {
      if (!validateCardDetails()) {
        payBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
        payBtn.disabled = false;
        return;
      }
    }

    if (selectedPaymentMethod === 'upi') {
      const upiId = document.getElementById('upiId').value;
      if (!upiId) {
        showNotification('Please select a UPI app or enter UPI ID', 'error');
        payBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
        payBtn.disabled = false;
        return;
      }
    }

    if (selectedPaymentMethod === 'netbanking' && !selectedBank) {
      showNotification('Please select a bank', 'error');
      payBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
      payBtn.disabled = false;
      return;
    }

    if (selectedPaymentMethod === 'wallet' && !selectedWallet) {
      showNotification('Please select a wallet', 'error');
      payBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
      payBtn.disabled = false;
      return;
    }

    // Simulate successful payment
    completePayment(finalAmount);
  }, 2000);
}

// Validate Card Details
function validateCardDetails() {
  const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const cardExpiry = document.getElementById('cardExpiry').value;
  const cardCvv = document.getElementById('cardCvv').value;
  const cardName = document.getElementById('cardName').value;

  if (!cardNumber || cardNumber.length < 13) {
    showNotification('Please enter a valid card number', 'error');
    return false;
  }

  if (!cardExpiry || cardExpiry.length < 5) {
    showNotification('Please enter a valid expiry date', 'error');
    return false;
  }

  if (!cardCvv || cardCvv.length < 3) {
    showNotification('Please enter a valid CVV', 'error');
    return false;
  }

  if (!cardName || cardName.trim().length < 3) {
    showNotification('Please enter cardholder name', 'error');
    return false;
  }

  return true;
}

// Complete Payment
function completePayment(amount) {
  // Generate order ID
  const orderId = 'ORD-2026-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  // Store order details
  const orderDetails = {
    orderId: orderId,
    amount: amount,
    paymentMethod: selectedPaymentMethod,
    date: new Date().toISOString(),
    items: cartItems,
    status: 'confirmed'
  };

  // In production, send to backend API
  console.log('Order placed:', orderDetails);

  // Clear cart
  localStorage.removeItem('cart');

  // Show success message
  showSuccessModal(orderId, amount);
}

// Show Success Modal
function showSuccessModal(orderId, amount) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      padding: 3rem;
      max-width: 500px;
      text-align: center;
      animation: slideUp 0.4s ease;
    ">
      <div style="
        width: 80px;
        height: 80px;
        background: #22c55e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
      ">
        <i class="fas fa-check" style="font-size: 2.5rem; color: white;"></i>
      </div>
      <h2 style="color: #1f2937; margin-bottom: 1rem;">Payment Successful!</h2>
      <p style="color: #6b7280; margin-bottom: 0.5rem;">Your order has been confirmed</p>
      <p style="font-size: 1.25rem; font-weight: 600; color: #ff5a00; margin-bottom: 0.5rem;">
        Order ID: ${orderId}
      </p>
      <p style="font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 2rem;">
        ₹${amount.toLocaleString()}
      </p>
      <div style="background: #dcfce7; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
        <p style="color: #065f46; font-size: 0.9rem; margin: 0;">
          <i class="fas fa-file-invoice"></i>
          GST invoice will be sent to your email
        </p>
      </div>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button onclick="window.location.href='Dashboard.html'" style="
          padding: 0.75rem 1.5rem;
          background: #ff5a00;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">View Orders</button>
        <button onclick="window.location.href='TopRowbanner.html'" style="
          padding: 0.75rem 1.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          color: #1f2937;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">Continue Shopping</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add animations via style tag
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

// Show Notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#22c55e' : '#ef4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-weight: 500;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Razorpay Integration Guide (for production implementation)
/*
RAZORPAY INTEGRATION STEPS:

1. Install Razorpay SDK:
   Add to HTML: <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

2. Create order on backend:
   POST /api/payment/create-order
   Body: { amount: 15000, currency: 'INR' }
   Response: { orderId, amount, currency }

3. Initialize Razorpay:
   var options = {
     key: 'YOUR_RAZORPAY_KEY_ID',
     amount: 15000, // in paise
     currency: 'INR',
     name: 'Sai Scientifics',
     description: 'Order Payment',
     order_id: orderId,
     handler: function(response) {
       // Payment successful
       verifyPayment(response);
     },
     prefill: {
       name: customerName,
       email: customerEmail,
       contact: customerPhone
     },
     theme: {
       color: '#ff5a00'
     }
   };
   var rzp = new Razorpay(options);
   rzp.open();

4. Verify payment on backend:
   POST /api/payment/verify
   Body: { 
     razorpay_order_id,
     razorpay_payment_id,
     razorpay_signature 
   }

5. On success, redirect to confirmation page

For now, this implementation uses mock payment flow for demonstration.
*/
