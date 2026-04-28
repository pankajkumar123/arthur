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

// Fetch products from backend API
let allProducts = [];
let filteredProducts = [];

// Load products from API
async function loadProductsFromAPI() {
  try {
    const products = await window.apiFetch('/catalog/products');
    
    // Transform API response to match expected format
    // API returns: id, name, description, sku, price, image_url, category_name, category_slug
    allProducts = products.map((product, index) => ({
      id: product.id,
      brand: product.category_name || 'Sai Scientifics', // Use category as brand or default
      name: product.name,
      price: parseFloat(product.price) || 0,
      originalPrice: Math.round(parseFloat(product.price) * 1.4), // Estimate: add 40% markup for original price
      discount: 30, // Default discount percentage (will be calculated from price data)
      image: product.image_url || 'https://images.unsplash.com/photo-1572806365626-e0a39b593c2f?w=300&h=300&fit=crop',
      category: product.category_slug || 'general',
      inStock: true,
      dispatch24hr: true,
      rating: 4.5 + (Math.random() * 0.4), // Random rating between 4.5-4.9
      reviews: Math.floor(Math.random() * 500) + 100 // Random reviews 100-600
    }));
    
    filteredProducts = [...allProducts];
    renderProducts();
    renderPagination();
    buildFilterLists();
  } catch (error) {
    console.error('Failed to load products from API:', error);
    // Fallback to mock data if API fails
    console.log('Using mock data as fallback');
    useMockProducts();
  }
}

// Fallback to mock products if API fails
function useMockProducts() {
  const mockProducts = [
  {
    id: 1,
    brand: '3M',
    name: 'Industrial Safety Helmet with Adjustable Ratchet',
    price: 549,
    originalPrice: 999,
    discount: 45,
    image: 'https://images.unsplash.com/photo-1572806365626-e0a39b593c2f?w=300&h=300&fit=crop',
    category: 'safety',
    inStock: true,
    dispatch24hr: true,
    rating: 4.5,
    reviews: 245
  },
  {
    id: 2,
    brand: 'Bosch',
    name: '18V Cordless Power Drill with 2 Batteries',
    price: 1949,
    originalPrice: 2999,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&h=300&fit=crop',
    category: 'tools',
    inStock: true,
    dispatch24hr: true,
    rating: 4.7,
    reviews: 512
  },
  {
    id: 3,
    brand: 'Honeywell',
    name: 'Ergonomic Office Chair with Lumbar Support',
    price: 3499,
    originalPrice: 6999,
    discount: 50,
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&h=300&fit=crop',
    category: 'furniture',
    inStock: true,
    dispatch24hr: false,
    rating: 4.3,
    reviews: 189
  },
  {
    id: 4,
    brand: '3M',
    name: 'Cut Resistant Gloves Level 5 (Pack of 12)',
    price: 899,
    originalPrice: 1499,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=300&h=300&fit=crop',
    category: 'safety',
    inStock: true,
    dispatch24hr: true,
    rating: 4.6,
    reviews: 328
  },
  {
    id: 5,
    brand: 'DeWalt',
    name: 'Professional Tool Set 108pc with Case',
    price: 4899,
    originalPrice: 6999,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop',
    category: 'tools',
    inStock: true,
    dispatch24hr: false,
    rating: 4.8,
    reviews: 421
  },
  {
    id: 6,
    brand: 'Philips',
    name: 'LED Panel Light 40W Square',
    price: 749,
    originalPrice: 1299,
    discount: 42,
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&h=300&fit=crop',
    category: 'electrical',
    inStock: true,
    dispatch24hr: true,
    rating: 4.4,
    reviews: 267
  },
  {
    id: 7,
    brand: 'HP',
    name: 'All-in-One Laser Printer with WiFi',
    price: 8499,
    originalPrice: 12999,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&h=300&fit=crop',
    category: 'office',
    inStock: true,
    dispatch24hr: false,
    rating: 4.2,
    reviews: 156
  },
  {
    id: 8,
    brand: 'Makita',
    name: 'Angle Grinder 850W Professional',
    price: 2599,
    originalPrice: 3999,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300&h=300&fit=crop',
    category: 'tools',
    inStock: true,
    dispatch24hr: true,
    rating: 4.6,
    reviews: 289
  },
  {
    id: 9,
    brand: 'Kimberly-Clark',
    name: 'Industrial Cleaning Wipes (100 sheets)',
    price: 299,
    originalPrice: 499,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=300&fit=crop',
    category: 'cleaning',
    inStock: true,
    dispatch24hr: true,
    rating: 4.3,
    reviews: 412
  },
  {
    id: 10,
    brand: 'Duracell',
    name: 'AA Alkaline Batteries (Pack of 24)',
    price: 449,
    originalPrice: 699,
    discount: 36,
    image: 'https://images.unsplash.com/photo-1602077748299-60d2e0cbb6fd?w=300&h=300&fit=crop',
    category: 'electrical',
    inStock: true,
    dispatch24hr: true,
    rating: 4.7,
    reviews: 598
  },
  {
    id: 11,
    brand: 'Stanley',
    name: 'Measuring Tape 7.5m Professional',
    price: 349,
    originalPrice: 599,
    discount: 42,
    image: 'https://images.unsplash.com/photo-1602407294553-6ac9170b3ed0?w=300&h=300&fit=crop',
    category: 'tools',
    inStock: true,
    dispatch24hr: true,
    rating: 4.5,
    reviews: 234
  },
  {
    id: 12,
    brand: 'Godrej',
    name: 'Office File Cabinet 4 Drawer Steel',
    price: 5999,
    originalPrice: 8999,
    discount: 33,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    category: 'furniture',
    inStock: true,
    dispatch24hr: false,
    rating: 4.4,
    reviews: 167
  }
];
  
  // Duplicate products to simulate large catalog
  allProducts = [];
  for (let i = 0; i < 8; i++) {
    allProducts = allProducts.concat(mockProducts.map(p => ({ ...p, id: p.id + (i * 100) })));
  }
  
  filteredProducts = [...allProducts];
  renderProducts();
  renderPagination();
  buildFilterLists();
}

// State management
let currentPage = 1;
const productsPerPage = 24;
let activeFilters = {
  category: [],
  price: [],
  brand: [],
  availability: [],
  discount: []
};

// Render product card
function renderProductCard(product) {
  const discountBadge = product.discount > 0 ? `<span class="badge discount">${product.discount}% OFF</span>` : '';
  const dispatchBadge = product.dispatch24hr ? `<span class="badge dispatch">24hr Dispatch</span>` : '';
  
  return `
    <article class="product-card" data-id="${product.id}" onclick="if(!event.target.closest('button')) window.location.href='ProductDetail.html?id=${product.id}'" style="cursor: pointer;">
      <div class="product-badges">
        ${discountBadge}
        ${dispatchBadge}
      </div>
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-pricing">
          <span class="product-price">₹${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span class="product-original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''}
          ${product.discount > 0 ? `<span class="product-discount">${product.discount}% OFF</span>` : ''}
        </div>
        <div class="product-meta">
          <span class="product-stock">
            <i class="fas fa-check-circle"></i> ${product.inStock ? 'In Stock' : 'Pre-Order'}
          </span>
          <div class="product-rating">
            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
            <span>(${product.reviews})</span>
          </div>
        </div>
        <div class="product-actions">
          <button class="add-to-cart" data-id="${product.id}">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          <button class="wishlist-btn" data-id="${product.id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

// Render products grid
function renderProducts() {
  const productsGrid = document.getElementById('productsGrid');
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const productsToShow = filteredProducts.slice(start, end);

  if (productsToShow.length === 0) {
    productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; padding: 40px;">No products found matching your filters.</p>';
    return;
  }

  productsGrid.innerHTML = productsToShow.map(renderProductCard).join('');
  
  // Update product count
  document.querySelector('.product-count').textContent = 
    `Showing ${start + 1}-${Math.min(end, filteredProducts.length)} of ${filteredProducts.length.toLocaleString()}+ products`;
  
  // Attach event listeners to add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', handleAddToCart);
  });

  // Attach event listeners to wishlist buttons
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', handleWishlist);
  });
}

// Handle add to cart
function handleAddToCart(e) {
  const productId = parseInt(e.currentTarget.dataset.id);
  const product = allProducts.find(p => p.id === productId);
  
  // Visual feedback
  const btn = e.currentTarget;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> Added';
  btn.style.background = '#22c55e';
  
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.style.background = '';
  }, 1500);

  // Update cart count
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const currentCount = parseInt(cartCount.textContent) || 0;
    cartCount.textContent = currentCount + 1;
  }

  console.log(`Added "${product.name}" to cart`);
}

// Handle wishlist
function handleWishlist(e) {
  const btn = e.currentTarget;
  const icon = btn.querySelector('i');
  
  if (icon.classList.contains('far')) {
    icon.classList.remove('far');
    icon.classList.add('fas');
    btn.style.background = '#fff0e4';
    btn.style.borderColor = 'var(--brand-orange)';
    btn.style.color = 'var(--brand-orange)';
  } else {
    icon.classList.remove('fas');
    icon.classList.add('far');
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
  }
}

// Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const pageNumbers = document.getElementById('pageNumbers');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  // Show max 7 page numbers
  let pages = [];
  if (totalPages <= 7) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    if (currentPage <= 4) {
      pages = [1, 2, 3, 4, 5, '...', totalPages];
    } else if (currentPage >= totalPages - 3) {
      pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }

  pageNumbers.innerHTML = pages.map(page => {
    if (page === '...') {
      return '<span style="padding: 0 8px;">...</span>';
    }
    return `<button class="page-num ${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
  }).join('');

  // Attach event listeners
  document.querySelectorAll('.page-num').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderProducts();
      renderPagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// Apply filters
function applyFilters() {
  filteredProducts = allProducts.filter(product => {
    // Category filter
    if (activeFilters.category.length > 0 && !activeFilters.category.includes(product.category)) {
      return false;
    }

    // Price filter
    if (activeFilters.price.length > 0) {
      const matchesPriceRange = activeFilters.price.some(range => {
        if (range === '0-500') return product.price <= 500;
        if (range === '500-1000') return product.price > 500 && product.price <= 1000;
        if (range === '1000-2500') return product.price > 1000 && product.price <= 2500;
        if (range === '2500-5000') return product.price > 2500 && product.price <= 5000;
        if (range === '5000+') return product.price > 5000;
        return false;
      });
      if (!matchesPriceRange) return false;
    }

    // Brand filter
    if (activeFilters.brand.length > 0 && !activeFilters.brand.includes(product.brand.toLowerCase())) {
      return false;
    }

    // Availability filter
    if (activeFilters.availability.includes('in-stock') && !product.inStock) {
      return false;
    }
    if (activeFilters.availability.includes('24hr-dispatch') && !product.dispatch24hr) {
      return false;
    }

    // Discount filter
    if (activeFilters.discount.length > 0) {
      const maxDiscountFilter = Math.max(...activeFilters.discount.map(d => parseInt(d)));
      if (product.discount < maxDiscountFilter) {
        return false;
      }
    }

    return true;
  });

  currentPage = 1;
  renderProducts();
  renderPagination();
  updateActiveFiltersDisplay();
}

// Update active filters display
function updateActiveFiltersDisplay() {
  const activeFiltersEl = document.getElementById('activeFilters');
  const filterChips = document.getElementById('filterChips');
  
  const allActiveFilters = [
    ...activeFilters.category.map(c => ({ type: 'category', value: c, label: c })),
    ...activeFilters.price.map(p => ({ type: 'price', value: p, label: `₹${p}` })),
    ...activeFilters.brand.map(b => ({ type: 'brand', value: b, label: b })),
    ...activeFilters.availability.map(a => ({ type: 'availability', value: a, label: a.replace('-', ' ') })),
    ...activeFilters.discount.map(d => ({ type: 'discount', value: d, label: `${d}%+ off` }))
  ];

  if (allActiveFilters.length === 0) {
    activeFiltersEl.style.display = 'none';
    return;
  }

  activeFiltersEl.style.display = 'flex';
  filterChips.innerHTML = allActiveFilters.map(filter => `
    <span class="filter-chip">
      ${filter.label}
      <button onclick="removeFilter('${filter.type}', '${filter.value}')">
        <i class="fas fa-times"></i>
      </button>
    </span>
  `).join('');
}

// Remove filter
window.removeFilter = function(type, value) {
  activeFilters[type] = activeFilters[type].filter(v => v !== value);
  
  // Uncheck the checkbox
  const checkbox = document.querySelector(`input[name="${type}"][value="${value}"]`);
  if (checkbox) checkbox.checked = false;
  
  applyFilters();
};

// Handle filter changes
document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', (e) => {
    const filterType = e.target.name;
    const filterValue = e.target.value;

    if (e.target.checked) {
      if (!activeFilters[filterType].includes(filterValue)) {
        activeFilters[filterType].push(filterValue);
      }
    } else {
      activeFilters[filterType] = activeFilters[filterType].filter(v => v !== filterValue);
    }

    applyFilters();
  });
});

// Clear all filters
document.getElementById('clearFilters').addEventListener('click', () => {
  // Reset active filters
  Object.keys(activeFilters).forEach(key => {
    activeFilters[key] = [];
  });

  // Uncheck all checkboxes
  document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });

  applyFilters();
});

// Sorting
document.getElementById('sortBy').addEventListener('change', (e) => {
  const sortValue = e.target.value;

  switch (sortValue) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      filteredProducts.sort((a, b) => b.id - a.id);
      break;
    case 'popularity':
      filteredProducts.sort((a, b) => b.reviews - a.reviews);
      break;
    case 'discount':
      filteredProducts.sort((a, b) => b.discount - a.discount);
      break;
    default:
      filteredProducts = filteredProducts.sort((a, b) => a.id - b.id);
  }

  renderProducts();
});

// View toggle
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const view = btn.dataset.view;
    const productsGrid = document.getElementById('productsGrid');

    if (view === 'list') {
      productsGrid.classList.add('list-view');
    } else {
      productsGrid.classList.remove('list-view');
    }
  });
});

// Pagination buttons
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderProducts();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderProducts();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// Brand search
document.getElementById('brandSearch').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const brandOptions = document.querySelectorAll('#brandOptions .filter-checkbox');

  brandOptions.forEach(option => {
    const brandName = option.querySelector('span').textContent.toLowerCase();
    if (brandName.includes(searchTerm)) {
      option.style.display = 'flex';
    } else {
      option.style.display = 'none';
    }
  });
});

// Build filter lists dynamically from products
function buildFilterLists() {
  if (allProducts.length === 0) return;
  
  // Extract unique brands
  const brands = [...new Set(allProducts.map(p => p.brand))].sort();
  const brandOptions = document.getElementById('brandOptions');
  if (brandOptions) {
    brandOptions.innerHTML = brands.map(brand => `
      <div class="filter-checkbox">
        <input type="checkbox" name="brand" value="${brand.toLowerCase()}">
        <span>${brand}</span>
      </div>
    `).join('');
    
    // Re-attach event listeners for new checkboxes
    document.querySelectorAll('#brandOptions input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!activeFilters.brand.includes(e.target.value)) {
            activeFilters.brand.push(e.target.value);
          }
        } else {
          activeFilters.brand = activeFilters.brand.filter(v => v !== e.target.value);
        }
        applyFilters();
      });
    });
  }
  
  // Extract unique categories
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  const categoryOptions = document.getElementById('categoryOptions');
  if (categoryOptions) {
    categoryOptions.innerHTML = categories.map(category => `
      <div class="filter-checkbox">
        <input type="checkbox" name="category" value="${category}">
        <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
      </div>
    `).join('');
    
    // Re-attach event listeners for new checkboxes
    document.querySelectorAll('#categoryOptions input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!activeFilters.category.includes(e.target.value)) {
            activeFilters.category.push(e.target.value);
          }
        } else {
          activeFilters.category = activeFilters.category.filter(v => v !== e.target.value);
        }
        applyFilters();
      });
    });
  }
}

// Initial render - load products from API
loadProductsFromAPI();
