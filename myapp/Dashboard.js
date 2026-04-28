// Dashboard.js - User Dashboard Functionality

// Authentication Check
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('customerToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || !user.fullName) {
    window.location.href = 'Login.html';
    return;
  }

  // Initialize dashboard
  initializeDashboard(user);
  loadCartCount();
  setupNavigation();
  setupLogout();
  loadDashboardData();
});

// Initialize Dashboard
function initializeDashboard(user) {
  // Update user info in header
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = user.fullName;
  }

  // Update profile info
  document.getElementById('profileName').textContent = user.fullName;
  document.getElementById('profileEmail').textContent = user.email || 'user@example.com';

  // Show user section, hide auth section
  const userSection = document.getElementById('userSection');
  const authSection = document.getElementById('authSection');
  if (userSection) userSection.style.display = 'flex';
  if (authSection) authSection.style.display = 'none';
}

// Load Cart Count
function loadCartCount() {
  const token = localStorage.getItem('customerToken');
  if (!token) return;

  fetch(`${window.API_BASE}/cart`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(res => res.json())
    .then(cart => {
      const cartCount = document.getElementById('cartCount');
      if (cartCount) {
        const count = Array.isArray(cart) ? cart.length : 0;
        cartCount.textContent = count;
      }
    })
    .catch(err => console.error('Failed to load cart count:', err));
}

// Navigation Setup
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.content-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.getAttribute('data-section');

      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Show target section
      sections.forEach(section => section.classList.remove('active'));
      const target = document.getElementById(targetSection);
      if (target) {
        target.classList.add('active');
      }

      // Load section data if needed
      loadSectionData(targetSection);
    });
  });

  // View all links
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = link.getAttribute('data-nav');
      const targetNav = document.querySelector(`[data-section="${targetSection}"]`);
      if (targetNav) {
        targetNav.click();
      }
    });
  });
}

// Logout Setup
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  const sidebarLogout = document.getElementById('sidebarLogout');

  [logoutBtn, sidebarLogout].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          localStorage.removeItem('customerToken');
          localStorage.removeItem('user');
          window.location.href = 'Login.html';
        }
      });
    }
  });
}

// Load Section Data
function loadSectionData(section) {
  switch (section) {
    case 'overview':
      loadOverview();
      break;
    case 'orders':
      loadOrders();
      break;
    case 'addresses':
      loadAddresses();
      break;
    case 'wishlist':
      loadWishlist();
      break;
    case 'invoices':
      loadInvoices();
      break;
    case 'rfqs':
      loadRFQs();
      break;
    case 'credit':
      loadCreditTransactions();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

// Load Dashboard Data
function loadDashboardData() {
  loadOverview();
}

// Mock Orders Data (kept for reference, actual data from API)
let ordersData = [];

// Load Overview
async function loadOverview() {
  try {
    // Load recent orders from API
    const token = localStorage.getItem('customerToken');
    const response = await fetch(`${window.API_BASE}/orders/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to load orders');
    ordersData = await response.json();

    const recentOrdersList = document.getElementById('recentOrdersList');
    if (recentOrdersList) {
      const recentOrders = ordersData.slice(0, 3);
      if (recentOrders.length === 0) {
        recentOrdersList.innerHTML = '<p style="text-align: center; color: #999;">No orders yet</p>';
      } else {
        recentOrdersList.innerHTML = recentOrders.map(order => `
          <div class="order-item">
            <div class="order-info">
              <span class="order-id">${order.order_number}</span>
              <span class="order-date">${formatDate(order.created_at)}</span>
            </div>
            <span class="order-status ${order.status}">${capitalizeFirst(order.status)}</span>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Error loading overview:', error);
  }
}

// Load All Orders
async function loadOrders() {
  const allOrdersList = document.getElementById('allOrdersList');
  if (!allOrdersList) return;

  try {
    // Fetch orders from API
    const token = localStorage.getItem('customerToken');
    const response = await fetch(`${window.API_BASE}/orders/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to load orders');
    const orders = await response.json();
    ordersData = orders;

    let currentFilter = 'all';

    const renderOrders = (filter = 'all') => {
      const filtered = filter === 'all' 
        ? orders
        : orders.filter(order => order.status === filter);

      if (filtered.length === 0) {
        allOrdersList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <p>No orders found</p>
          </div>
        `;
        return;
      }

      allOrdersList.innerHTML = filtered.map(order => `
        <div class="order-card">
          <div class="order-header">
            <div class="order-header-left">
              <div class="order-header-item">
                <label>Order ID</label>
                <strong>${order.order_number}</strong>
              </div>
              <div class="order-header-item">
                <label>Order Date</label>
                <strong>${formatDate(order.created_at)}</strong>
              </div>
              <div class="order-header-item">
                <label>Total</label>
                <strong>₹${order.total_amount.toLocaleString()}</strong>
              </div>
            </div>
            <span class="order-status ${order.status}">${capitalizeFirst(order.status)}</span>
          </div>
          <div class="order-body">
            <div class="order-address">
              <strong>Delivery Address:</strong>
              <p>${order.delivery_address}, ${order.city}, ${order.state} ${order.pincode}</p>
            </div>
          </div>
          <div class="order-footer">
            <div class="order-actions">
              <a href="TrackOrder.html?orderId=${order.id}" class="secondary-btn">
                <i class="fas fa-shipping-fast"></i> Track Order
              </a>
              <button class="secondary-btn" onclick="downloadInvoice('${order.order_number}')">
                <i class="fas fa-download"></i> Download Invoice
              </button>
              ${order.status === 'delivered' ? `
                <button class="primary-btn" onclick="reorder('${order.id}')">
                  <i class="fas fa-redo"></i> Reorder
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('');
    };

    // Initial render
    renderOrders();

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderOrders(currentFilter);
      });
    });
  } catch (error) {
    console.error('Error loading orders:', error);
    allOrdersList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load orders</p>
      </div>
    `;
  }
}

// Mock Addresses Data
const mockAddresses = [
  {
    id: 1,
    name: 'Office Address',
    address: '123 Industrial Area, Phase 2, Sector 45, Gurgaon, Haryana - 122003',
    phone: '+91 918275568',
    isDefault: true
  },
  {
    id: 2,
    name: 'Warehouse',
    address: '456 Logistics Hub, RIICO Industrial Area, Bhiwadi, Rajasthan - 301019',
    phone: '+91 918275568',
    isDefault: false
  }
];

// Load Addresses
function loadAddresses() {
  const addressesList = document.getElementById('addressesList');
  if (!addressesList) return;

  const renderAddresses = () => {
    addressesList.innerHTML = mockAddresses.map(addr => `
      <div class="address-card ${addr.isDefault ? 'default' : ''}">
        ${addr.isDefault ? '<span class="default-badge">Default</span>' : ''}
        <div class="address-name">${addr.name}</div>
        <div class="address-details">
          ${addr.address}<br>
          Phone: ${addr.phone}
        </div>
        <div class="address-actions">
          <button class="edit-btn" onclick="editAddress(${addr.id})">
            <i class="fas fa-edit"></i> Edit
          </button>
          ${!addr.isDefault ? `
            <button class="delete-btn" onclick="deleteAddress(${addr.id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  };

  renderAddresses();

  // Add address button
  const addAddressBtn = document.getElementById('addAddressBtn');
  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', () => {
      alert('Add Address functionality would open a form modal');
    });
  }
}

// Mock Wishlist Data
const mockWishlist = [
  { id: 1, name: '3M Safety Helmet with Face Shield', price: 2490, image: 'https://via.placeholder.com/240' },
  { id: 2, name: 'Bosch Professional Power Drill Kit', price: 4480, image: 'https://via.placeholder.com/240' },
  { id: 3, name: 'DeWalt Cordless Impact Driver Set', price: 3920, image: 'https://via.placeholder.com/240' },
  { id: 4, name: 'Honeywell N95 Respirator Masks', price: 2260, image: 'https://via.placeholder.com/240' },
  { id: 5, name: 'Stanley Toolbox Professional', price: 1850, image: 'https://via.placeholder.com/240' }
];

// Load Wishlist
function loadWishlist() {
  const wishlistGrid = document.getElementById('wishlistGrid');
  if (!wishlistGrid) return;

  if (mockWishlist.length === 0) {
    wishlistGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-heart"></i>
        <p>Your wishlist is empty</p>
        <a href="Products.html" class="primary-btn">Browse Products</a>
      </div>
    `;
    return;
  }

  wishlistGrid.innerHTML = mockWishlist.map(item => `
    <div class="wishlist-item">
      <img src="${item.image}" alt="${item.name}" class="wishlist-item-image">
      <button class="remove-wishlist-btn" onclick="removeFromWishlist(${item.id})">
        <i class="fas fa-times"></i>
      </button>
      <div class="wishlist-item-details">
        <div class="wishlist-item-name">${item.name}</div>
        <div class="wishlist-item-price">₹${item.price.toLocaleString()}</div>
        <button class="wishlist-item-btn" onclick="addToCartFromWishlist(${item.id})">
          <i class="fas fa-shopping-cart"></i> Add to Cart
        </button>
      </div>
    </div>
  `).join('');
}

// Load Invoices
function loadInvoices() {
  const invoicesTableBody = document.getElementById('invoicesTableBody');
  if (!invoicesTableBody) return;

  const invoices = mockOrders.map((order, index) => ({
    invoiceNo: `INV-2026-${String(index + 1).padStart(3, '0')}`,
    orderId: order.id,
    date: order.date,
    amount: order.total / 1.18,
    gst: order.total * 0.18 / 1.18,
    total: order.total
  }));

  invoicesTableBody.innerHTML = invoices.map(inv => `
    <tr>
      <td>${inv.invoiceNo}</td>
      <td>${inv.orderId}</td>
      <td>${formatDate(inv.date)}</td>
      <td>₹${Math.round(inv.amount).toLocaleString()}</td>
      <td>₹${Math.round(inv.gst).toLocaleString()}</td>
      <td><strong>₹${inv.total.toLocaleString()}</strong></td>
      <td>
        <button class="download-invoice-btn" onclick="downloadInvoice('${inv.invoiceNo}')">
          <i class="fas fa-download"></i> Download
        </button>
      </td>
    </tr>
  `).join('');
}

// Mock RFQs Data
const mockRFQs = [
  {
    id: 'RFQ-2026-001',
    date: '2026-02-13',
    product: 'Industrial Safety Equipment Bulk Order',
    details: 'Need 500 units of safety helmets and 1000 units of safety goggles',
    status: 'quoted',
    quote: 125000
  },
  {
    id: 'RFQ-2026-002',
    date: '2026-02-11',
    product: 'Power Tools for Construction Site',
    details: '50 cordless drills, 30 impact drivers, 20 angle grinders',
    status: 'pending',
    quote: null
  },
  {
    id: 'RFQ-2026-003',
    date: '2026-02-08',
    product: 'Office Furniture Complete Setup',
    details: '100 office chairs, 50 desks, 20 filing cabinets',
    status: 'approved',
    quote: 450000
  }
];

// Load RFQs
function loadRFQs() {
  const rfqsList = document.getElementById('rfqsList');
  if (!rfqsList) return;

  if (mockRFQs.length === 0) {
    rfqsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-file-alt"></i>
        <p>No quote requests found</p>
        <a href="Requestforquotes.html" class="primary-btn">Request Quote</a>
      </div>
    `;
    return;
  }

  rfqsList.innerHTML = mockRFQs.map(rfq => `
    <div class="rfq-card">
      <div class="rfq-header">
        <div>
          <div class="rfq-id">${rfq.id}</div>
          <div class="rfq-date">${formatDate(rfq.date)}</div>
        </div>
        <span class="rfq-status ${rfq.status}">${capitalizeFirst(rfq.status)}</span>
      </div>
      <div class="rfq-body">
        <div class="rfq-product-name">${rfq.product}</div>
        <div class="rfq-details">${rfq.details}</div>
      </div>
      <div class="rfq-footer">
        ${rfq.quote ? `<div class="rfq-quote">Quote: ₹${rfq.quote.toLocaleString()}</div>` : '<div></div>'}
        <div class="order-actions">
          <button class="secondary-btn" onclick="viewRFQ('${rfq.id}')">
            <i class="fas fa-eye"></i> View Details
          </button>
          ${rfq.status === 'quoted' ? `
            <button class="primary-btn" onclick="acceptQuote('${rfq.id}')">
              <i class="fas fa-check"></i> Accept Quote
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// Mock Credit Transactions
const mockCreditTransactions = [
  { date: '2026-02-10', description: 'Payment Received', orderId: 'ORD-2026-001', amount: -25000, status: 'completed' },
  { date: '2026-02-08', description: 'Purchase Order', orderId: 'ORD-2026-004', amount: 15000, status: 'pending' },
  { date: '2026-02-05', description: 'Payment Received', orderId: 'ORD-2026-005', amount: -35000, status: 'completed' },
  { date: '2026-02-01', description: 'Purchase Order', orderId: 'ORD-2026-003', amount: 45000, status: 'pending' }
];

// Load Credit Transactions
function loadCreditTransactions() {
  const creditTransactionsBody = document.getElementById('creditTransactionsBody');
  if (!creditTransactionsBody) return;

  creditTransactionsBody.innerHTML = mockCreditTransactions.map(txn => `
    <tr>
      <td>${formatDate(txn.date)}</td>
      <td>${txn.description}</td>
      <td>${txn.orderId}</td>
      <td style="color: ${txn.amount < 0 ? 'green' : 'red'}">
        ${txn.amount < 0 ? '-' : '+'}₹${Math.abs(txn.amount).toLocaleString()}
      </td>
      <td>
        <span class="order-status ${txn.status}">${capitalizeFirst(txn.status)}</span>
      </td>
    </tr>
  `).join('');
}

// Load Settings
function loadSettings() {
  const userName = localStorage.getItem('customerName') || '';
  const userEmail = localStorage.getItem('customerEmail') || '';

  // Populate form fields
  document.getElementById('settingsName').value = userName;
  document.getElementById('settingsEmail').value = userEmail;
  document.getElementById('settingsPhone').value = '+91 918275568';

  // Setup form handlers
  setupSettingsForms();
}

// Setup Settings Forms
function setupSettingsForms() {
  // Personal Info Form
  const personalInfoForm = document.getElementById('personalInfoForm');
  if (personalInfoForm) {
    personalInfoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('settingsName').value;
      const email = document.getElementById('settingsEmail').value;
      
      localStorage.setItem('customerName', name);
      localStorage.setItem('customerEmail', email);
      
      showNotification('Personal information updated successfully!', 'success');
      initializeDashboard(name);
    });
  }

  // Password Form
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
      }
      
      showNotification('Password updated successfully!', 'success');
      passwordForm.reset();
    });
  }

  // GST Form
  const gstForm = document.getElementById('gstForm');
  if (gstForm) {
    gstForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showNotification('GST information saved successfully!', 'success');
    });
  }
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showNotification(message, type = 'success') {
  // Get or create notification container
  let container = document.getElementById('notificationContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    document.body.appendChild(container);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  const bgColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
  
  notification.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    margin-bottom: 0.75rem;
    background: ${bgColor};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
    font-size: 0.95rem;
  `;
  
  notification.innerHTML = `
    <span style="font-size: 1.25rem; font-weight: bold;">${icon}</span>
    <span style="flex: 1;">${message}</span>
  `;
  
  container.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
      // Remove container if empty
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 3000);
}

// Global Functions (called from HTML)
window.downloadInvoice = function(invoiceId) {
  showNotification(`Downloading invoice ${invoiceId}...`, 'success');
  // In production, this would trigger actual PDF download
};

window.reorder = function(orderId) {
  showNotification(`Reordering items from ${orderId}...`, 'success');
  setTimeout(() => {
    window.location.href = 'Cart.html';
  }, 1500);
};

window.editAddress = function(addressId) {
  showNotification('Edit address functionality would open a form', 'success');
};

window.deleteAddress = function(addressId) {
  if (confirm('Are you sure you want to delete this address?')) {
    showNotification('Address deleted successfully', 'success');
    const index = mockAddresses.findIndex(a => a.id === addressId);
    if (index > -1) {
      mockAddresses.splice(index, 1);
      loadAddresses();
    }
  }
};

window.removeFromWishlist = function(itemId) {
  const index = mockWishlist.findIndex(i => i.id === itemId);
  if (index > -1) {
    mockWishlist.splice(index, 1);
    loadWishlist();
    showNotification('Item removed from wishlist', 'success');
  }
};

window.addToCartFromWishlist = function(itemId) {
  const item = mockWishlist.find(i => i.id === itemId);
  if (item) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartCount();
    showNotification('Item added to cart', 'success');
  }
};

window.viewRFQ = function(rfqId) {
  showNotification(`Viewing RFQ ${rfqId}...`, 'success');
};

window.acceptQuote = function(rfqId) {
  if (confirm('Accept this quote and proceed to payment?')) {
    showNotification('Quote accepted! Redirecting to checkout...', 'success');
    setTimeout(() => {
      window.location.href = 'Cart.html';
    }, 1500);
  }
};

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
