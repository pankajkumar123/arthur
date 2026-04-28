// Auth state management
function checkAuthState() {
  const token = localStorage.getItem('customerToken');
  const userName = localStorage.getItem('customerName');
  const authSection = document.getElementById('authSection');
  const userSection = document.getElementById('userSection');
  const userNameEl = document.getElementById('userName');

  if (token && userName) {
    authSection.style.display = 'none';
    userSection.style.display = 'flex';
    userNameEl.textContent = `Hello, ${userName.split(' ')[0]}`;
  } else {
    authSection.style.display = 'flex';
    userSection.style.display = 'none';
  }
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('customerToken');
    if (token) {
      try {
        await window.apiFetch('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (e) {
        console.warn('Logout request failed:', e);
      }
    }
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerName');
    window.location.reload();
  });
}

checkAuthState();

// Get product ID from URL
function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Load product details from API
async function loadProductDetails() {
  const productId = getProductIdFromURL();
  
  if (!productId) {
    console.error('No product ID in URL');
    return;
  }

  try {
    const product = await window.apiFetch(`/catalog/products/${productId}`);
    
    // Update page with product data
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.product-description').textContent = product.description || '';
    document.querySelector('.product-brand').textContent = product.category_name || 'Sai Scientifics';
    document.querySelector('.product-price').textContent = `₹${parseFloat(product.price).toLocaleString('en-IN')}`;
    document.querySelector('.product-original-price').textContent = `₹${Math.round(parseFloat(product.price) * 1.4).toLocaleString('en-IN')}`;
    
    // Update images
    const mainImage = document.getElementById('mainImage');
    if (product.image_url) {
      mainImage.src = product.image_url.replace('w=600&h=600', 'w=600&h=600');
    }
    
    // Update category breadcrumb if present
    const categoryBreadcrumb = document.querySelector('.category-breadcrumb');
    if (categoryBreadcrumb) {
      categoryBreadcrumb.textContent = product.category_name || 'Category';
    }
    
    console.log('Product details loaded:', product);
  } catch (error) {
    console.error('Failed to load product details:', error);
  }
}

// Load product details when page loads
loadProductDetails();

// Image gallery
const mainImage = document.getElementById('mainImage');
const thumbnails = document.querySelectorAll('.thumbnail');

thumbnails.forEach(thumbnail => {
  thumbnail.addEventListener('click', () => {
    // Remove active class from all thumbnails
    thumbnails.forEach(t => t.classList.remove('active'));
    
    // Add active class to clicked thumbnail
    thumbnail.classList.add('active');
    
    // Change main image
    mainImage.src = thumbnail.src.replace('w=100&h=100', 'w=600&h=600');
  });
});

// Wishlist functionality
const wishlistIcon = document.querySelector('.wishlist-icon');
if (wishlistIcon) {
  wishlistIcon.addEventListener('click', () => {
    wishlistIcon.classList.toggle('active');
    const icon = wishlistIcon.querySelector('i');
    
    if (wishlistIcon.classList.contains('active')) {
      icon.classList.remove('far');
      icon.classList.add('fas');
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
    }
  });
}

// Quantity controls
const quantityInput = document.getElementById('quantity');
const decreaseBtn = document.getElementById('decreaseQty');
const increaseBtn = document.getElementById('increaseQty');

if (decreaseBtn && increaseBtn && quantityInput) {
  decreaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value) || 1;
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });

  increaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value) || 1;
    if (currentValue < 999) {
      quantityInput.value = currentValue + 1;
    }
  });

  quantityInput.addEventListener('change', () => {
    const value = parseInt(quantityInput.value) || 1;
    if (value < 1) {
      quantityInput.value = 1;
    } else if (value > 999) {
      quantityInput.value = 999;
    }
  });
}

// Add to Cart functionality
const addToCartBtn = document.querySelector('.add-to-cart-btn');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', () => {
    const quantity = parseInt(quantityInput.value) || 1;
    const productName = document.querySelector('.product-title').textContent;
    
    // Visual feedback
    const originalHTML = addToCartBtn.innerHTML;
    addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
    addToCartBtn.style.background = '#22c55e';
    
    setTimeout(() => {
      addToCartBtn.innerHTML = originalHTML;
      addToCartBtn.style.background = '';
    }, 2000);

    // Update cart count
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      const currentCount = parseInt(cartCount.textContent) || 0;
      cartCount.textContent = currentCount + quantity;
    }

    console.log(`Added ${quantity} x "${productName}" to cart`);
  });
}

// Buy Now functionality
const buyNowBtn = document.querySelector('.buy-now-btn');
if (buyNowBtn) {
  buyNowBtn.addEventListener('click', () => {
    const quantity = parseInt(quantityInput.value) || 1;
    const productName = document.querySelector('.product-title').textContent;
    
    // Update cart count
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      const currentCount = parseInt(cartCount.textContent) || 0;
      cartCount.textContent = currentCount + quantity;
    }

    // Redirect to cart/checkout
    console.log(`Buy now: ${quantity} x "${productName}"`);
    alert('Redirecting to checkout... (Feature in development)');
    // window.location.href = 'Cart.html';
  });
}

// Request Quote functionality
const rfqBtn = document.querySelector('.rfq-btn');
if (rfqBtn) {
  rfqBtn.addEventListener('click', () => {
    window.location.href = 'Requestforquotes.html';
  });
}

// Bulk Order functionality
const bulkOrderBtn = document.querySelector('.bulk-order-btn');
if (bulkOrderBtn) {
  bulkOrderBtn.addEventListener('click', () => {
    alert('Bulk order inquiry form will open here. For immediate assistance, call +91 918275568');
    // Can be enhanced with a modal form
  });
}

// Contact Seller functionality
const contactSellerBtn = document.querySelector('.contact-seller-btn');
if (contactSellerBtn) {
  contactSellerBtn.addEventListener('click', () => {
    window.location.href = 'HelpCentre.html';
  });
}

// Pincode checker
const pincodeInput = document.getElementById('pincode');
const checkBtn = document.querySelector('.check-btn');

if (checkBtn && pincodeInput) {
  checkBtn.addEventListener('click', () => {
    const pincode = pincodeInput.value.trim();
    
    if (!pincode) {
      alert('Please enter a pincode');
      return;
    }

    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    // Simulate API call
    checkBtn.textContent = 'Checking...';
    checkBtn.disabled = true;

    setTimeout(() => {
      alert(`Delivery available to ${pincode}!\nEstimated delivery: 3-5 business days\nFree delivery on orders above ₹5,000`);
      checkBtn.textContent = 'Check';
      checkBtn.disabled = false;
    }, 1000);
  });
}

// Tabs functionality
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.dataset.tab;

    // Remove active class from all buttons and panels
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    // Add active class to clicked button and corresponding panel
    button.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
  });
});

// Write Review functionality
const writeReviewBtn = document.querySelector('.write-review-btn');
if (writeReviewBtn) {
  writeReviewBtn.addEventListener('click', () => {
    window.location.href = 'WriteReview.html';
  });
}

// Ask Question functionality
const askQuestionBtn = document.querySelector('.ask-question-btn');
if (askQuestionBtn) {
  askQuestionBtn.addEventListener('click', () => {
    alert('Question form will open here. For immediate assistance, call +91 918275568 or email sales@saiscientifics.com');
    // Can be enhanced with a modal form
  });
}

// Helpful button functionality
const helpfulButtons = document.querySelectorAll('.helpful-btn');
helpfulButtons.forEach(button => {
  button.addEventListener('click', () => {
    const icon = button.querySelector('i');
    if (icon.classList.contains('far')) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      button.style.color = 'var(--brand-orange)';
      button.style.borderColor = 'var(--brand-orange)';
      
      // Increment count
      const text = button.textContent;
      const match = text.match(/\((\d+)\)/);
      if (match) {
        const count = parseInt(match[1]) + 1;
        button.innerHTML = `<i class="fas fa-thumbs-up"></i> Helpful (${count})`;
      }
    }
  });
});

// Load More functionality
const loadMoreBtns = document.querySelectorAll('.load-more-btn');
loadMoreBtns.forEach(button => {
  button.addEventListener('click', () => {
    button.textContent = 'Loading...';
    
    setTimeout(() => {
      alert('Feature in development: More reviews/questions will be loaded');
      button.textContent = button.parentElement.classList.contains('reviews-list') ? 'Load More Reviews' : 'Load More Questions';
    }, 500);
  });
});

// Related products data
const relatedProducts = [
  {
    id: 2,
    name: '3M Safety Goggles - Clear Lens',
    price: 299,
    originalPrice: 499,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Industrial Work Gloves - Pack of 5',
    price: 449,
    originalPrice: 699,
    discount: 36,
    image: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=300&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Safety Vest - Reflective Orange',
    price: 199,
    originalPrice: 349,
    discount: 43,
    image: 'https://images.unsplash.com/photo-1579618959146-e20a170f2c3a?w=300&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'Steel Toe Safety Boots',
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300&h=300&fit=crop'
  }
];

// Render related products
const relatedProductsGrid = document.getElementById('relatedProducts');
if (relatedProductsGrid) {
  relatedProductsGrid.innerHTML = relatedProducts.map(product => `
    <article class="product-card" style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-tight); cursor: pointer; transition: transform 0.2s;">
      <div style="position: relative;">
        <span style="position: absolute; top: 8px; left: 8px; background: #ff3b3b; color: #fff; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; z-index: 5;">${product.discount}% OFF</span>
        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;">
      </div>
      <div style="padding: 16px;">
        <h3 style="margin: 0 0 12px; font-size: 15px; min-height: 40px; line-height: 1.3;">${product.name}</h3>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <span style="font-size: 20px; font-weight: 700; color: var(--brand-orange);">₹${product.price}</span>
          <span style="font-size: 14px; color: var(--brand-muted); text-decoration: line-through;">₹${product.originalPrice}</span>
        </div>
        <button class="related-add-to-cart" data-id="${product.id}" data-name="${product.name}" style="width: 100%; background: var(--brand-orange); color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </article>
  `).join('');

  // Add to cart for related products
  document.querySelectorAll('.related-add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const productName = button.dataset.name;
      
      // Visual feedback
      button.innerHTML = '<i class="fas fa-check"></i> Added';
      button.style.background = '#22c55e';
      
      setTimeout(() => {
        button.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
        button.style.background = '';
      }, 1500);

      // Update cart count
      const cartCount = document.getElementById('cartCount');
      if (cartCount) {
        const currentCount = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = currentCount + 1;
      }

      console.log(`Added "${productName}" to cart from related products`);
    });
  });

  // Click on product card to view details
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.related-add-to-cart')) {
        alert('Product detail page navigation (Feature in development)');
        // window.location.href = 'ProductDetail.html?id=' + productId;
      }
    });
  });
}

// Smooth scroll to reviews when clicking review link
const reviewsLink = document.querySelector('.reviews-link');
if (reviewsLink) {
  reviewsLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Switch to reviews tab
    const reviewsTabBtn = document.querySelector('[data-tab="reviews"]');
    if (reviewsTabBtn) {
      reviewsTabBtn.click();
    }
    
    // Scroll to tab section
    const tabsSection = document.querySelector('.product-tabs-section');
    if (tabsSection) {
      tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

console.log('Product Detail page loaded successfully');
