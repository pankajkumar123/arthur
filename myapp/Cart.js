let cartItems = [];

const TAX_RATE = 0.18; // 18% tax
const SHIPPING_COST = 100;

// DOM Elements
const cartItemsContainer = document.getElementById('cartItems');
const emptyCart = document.getElementById('emptyCart');
const itemCount = document.getElementById('itemCount');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const taxEl = document.getElementById('tax');
const discountEl = document.getElementById('discount');
const totalEl = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');
const applyPromoBtn = document.getElementById('applyPromo');
const promoInput = document.getElementById('promoCode');
const checkoutModal = document.getElementById('checkoutModal');
const successModal = document.getElementById('successModal');
const closeCheckout = document.getElementById('closeCheckout');
const modalOverlay = document.getElementById('modalOverlay');
const checkoutForm = document.getElementById('checkoutForm');
const pageBody = document.body;
const notify = window.showNotice || (() => {});

let discountAmount = 0;

function setModalState(modal, isOpen) {
  if (!modal) {
    return;
  }

  modal.classList.toggle('show', isOpen);
  modal.setAttribute('aria-hidden', String(!isOpen));
  modalOverlay.classList.toggle('show', isOpen);
  pageBody.style.overflow = isOpen ? 'hidden' : '';

  if (isOpen) {
    const focusTarget = modal.querySelector('input, select, textarea, button');
    if (focusTarget) {
      focusTarget.focus();
    }
  }
}

function isAuthenticated() {
  const token = localStorage.getItem('customerToken');
  return !!token;
}

async function loadCart() {
  if (!isAuthenticated()) {
    cartItems = [];
    return;
  }

  try {
    const cart = await fetch(`${window.API_BASE}/cart`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
      }
    }).then(res => res.json());

    cartItems = cart.map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      image: item.image_url,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));
  } catch (error) {
    console.error('Failed to load cart:', error);
    cartItems = [];
  }
}

// Initialize cart
async function initCart() {
  try {
    if (!isAuthenticated()) {
      emptyCart.innerHTML = '<p style="text-align: center; padding: 40px;">Please <a href="Login.html">log in</a> to view your cart</p>';
      emptyCart.classList.add('show');
      cartItemsContainer.style.display = 'none';
      checkoutBtn.disabled = true;
      return;
    }

    await loadCart();
    renderCart();
    updateSummary();
  } catch (error) {
    notify(error.message, 'error');
  }
}

// Render cart items
function renderCart() {
  cartItemsContainer.innerHTML = '';

  if (cartItems.length === 0) {
    cartItemsContainer.style.display = 'none';
    emptyCart.classList.add('show');
    return;
  }

  cartItemsContainer.style.display = 'flex';
  emptyCart.classList.remove('show');

  cartItems.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="item-image">${item.image ? `<img src="${item.image}" alt="${item.name}">` : '📦'}</div>
      <div class="item-details">
        <h3>${item.name}</h3>
        <div class="item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
        <small>₹${item.price.toLocaleString()} each</small>
      </div>
      <div class="item-controls">
        <div class="quantity-control">
          <button onclick="decreaseQuantity(${item.id})" class="decrease-btn">−</button>
          <input type="number" value="${item.quantity}" readonly>
          <button onclick="increaseQuantity(${item.id})" class="increase-btn">+</button>
        </div>
        <button onclick="removeItem(${item.id})" class="remove-btn">Remove</button>
      </div>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  updateItemCount();
}

async function updateQuantity(itemId, nextQty) {
  try {
    await fetch(`${window.API_BASE}/cart/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
      },
      body: JSON.stringify({ quantity: nextQty })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update quantity');
      return res.json();
    });
    await loadCart();
    renderCart();
    updateSummary();
  } catch (error) {
    notify(error.message, 'error');
  }
}

// Increase quantity
// eslint-disable-next-line no-unused-vars
function increaseQuantity(itemId) {
  const item = cartItems.find(i => i.id === itemId);
  if (item) {
    updateQuantity(itemId, item.quantity + 1).catch((error) => notify(error.message, 'error'));
  }
}

// Decrease quantity
// eslint-disable-next-line no-unused-vars
function decreaseQuantity(itemId) {
  const item = cartItems.find(i => i.id === itemId);
  if (item && item.quantity > 1) {
    updateQuantity(itemId, item.quantity - 1).catch((error) => notify(error.message, 'error'));
  }
}

// Remove item
// eslint-disable-next-line no-unused-vars
function removeItem(itemId) {
  fetch(`${window.API_BASE}/cart/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
    }
  }).then(async (res) => {
    if (!res.ok) throw new Error('Failed to remove item');
    await loadCart();
    renderCart();
    updateSummary();
  }).catch((error) => notify(error.message, 'error'));
}

// Update item count
function updateItemCount() {
  const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  itemCount.textContent = `${total} item${total !== 1 ? 's' : ''}`;
}

// Calculate subtotal
function calculateSubtotal() {
  return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Update summary
function updateSummary() {
  const subtotal = calculateSubtotal();
  const shipping = subtotal > 5000 ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax - discountAmount;

  subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
  shippingEl.textContent = `₹${shipping}`;
  taxEl.textContent = `₹${Math.round(tax).toLocaleString()}`;
  discountEl.textContent = `-₹${discountAmount.toLocaleString()}`;
  totalEl.textContent = `₹${Math.round(total).toLocaleString()}`;

  // Update checkout button status
  checkoutBtn.disabled = cartItems.length === 0;
}

// Apply promo code
applyPromoBtn.addEventListener('click', () => {
  const code = promoInput.value.toUpperCase().trim();

  if (!code) {
    notify('Please enter a promo code', 'error');
    return;
  }

  // Sample promo codes
  const promoCodes = {
    'SAVE10': { discount: 0.10, label: '10% discount' },
    'SAVE20': { discount: 0.20, label: '20% discount' },
    'FLAT500': { discount: 500, label: '₹500 off' },
    'WELCOME': { discount: 0.05, label: '5% discount' }
  };

  if (promoCodes[code]) {
    const subtotal = calculateSubtotal();
    const promoInfo = promoCodes[code];

    // Calculate discount
    if (typeof promoInfo.discount === 'number' && promoInfo.discount < 1) {
      discountAmount = Math.round(subtotal * promoInfo.discount);
    } else {
      discountAmount = promoInfo.discount;
    }

    updateSummary();
    notify(`Promo code "${code}" applied! You saved ₹${discountAmount}`, 'success');
    promoInput.value = '';
    applyPromoBtn.textContent = '✓ Applied';
    applyPromoBtn.disabled = true;
  } else {
    notify('Invalid promo code. Try: SAVE10, SAVE20, FLAT500, or WELCOME', 'error');
  }
});

// Checkout button
checkoutBtn.addEventListener('click', () => {
  if (cartItems.length === 0) {
    notify('Your cart is empty', 'error');
    return;
  }

  setModalState(checkoutModal, true);
});

// Close checkout modal
closeCheckout.addEventListener('click', () => {
  setModalState(checkoutModal, false);
});

modalOverlay.addEventListener('click', () => {
  setModalState(checkoutModal, false);
  setModalState(successModal, false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    setModalState(checkoutModal, false);
    setModalState(successModal, false);
  }
});

// Checkout form submission
checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!isAuthenticated()) {
    notify('Please log in to place an order', 'error');
    return;
  }

  const formData = new FormData(checkoutForm);
  const data = Object.fromEntries(formData);

  // Validate form
  if (!validateCheckoutForm(data)) {
    return;
  }

  // Create order
  try {
    const response = await fetch(`${window.API_BASE}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
      },
      body: JSON.stringify({
        addressLine: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        paymentMethod: data.paymentMethod
      })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    });

    notify('Order created! Redirecting to payment...', 'success');
    
    // Redirect to payment page
    setTimeout(() => {
      window.location.href = `Payment.html?orderId=${response.orderId}`;
    }, 1500);
  } catch (error) {
    notify(error.message, 'error');
  }
});

// Validate checkout form
function validateCheckoutForm(data) {
  // Check email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    notify('Please enter a valid email address', 'error');
    return false;
  }

  // Check phone
  if (data.phone.length !== 10 || !/^\d+$/.test(data.phone)) {
    notify('Please enter a valid 10-digit phone number', 'error');
    return false;
  }

  // Check pincode
  if (data.pincode.length !== 6 || !/^\d+$/.test(data.pincode)) {
    notify('Please enter a valid 6-digit pincode', 'error');
    return false;
  }

  return true;
}

// Order IDs are generated by the backend.

// Phone input formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
  });
}

// Pincode input formatting
const pincodeInput = document.getElementById('pincode');
if (pincodeInput) {
  pincodeInput.addEventListener('input', () => {
    pincodeInput.value = pincodeInput.value.replace(/\D/g, '').slice(0, 6);
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCart);

