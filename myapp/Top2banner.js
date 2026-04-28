// Sidebar functionality
const categoriesBtn = document.getElementById('categoriesBtn');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const cartBadge = document.getElementById('cartBadge');
const pageBody = document.body;

// Open sidebar
categoriesBtn.addEventListener('click', () => {
  sidebar.classList.add('active');
  sidebarOverlay.classList.add('active');
  sidebar.setAttribute('aria-hidden', 'false');
  categoriesBtn.setAttribute('aria-expanded', 'true');
  pageBody.style.overflow = 'hidden';
});

// Close sidebar
sidebarClose.addEventListener('click', () => {
  closeSidebar();
});

sidebarOverlay.addEventListener('click', () => {
  closeSidebar();
});

function closeSidebar() {
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  sidebar.setAttribute('aria-hidden', 'true');
  categoriesBtn.setAttribute('aria-expanded', 'false');
  pageBody.style.overflow = '';
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.classList.contains('active')) {
    closeSidebar();
  }
});

// Close sidebar on menu item click
const sidebarMenuItems = document.querySelectorAll('.sidebar-menu a');
sidebarMenuItems.forEach(item => {
  item.addEventListener('click', () => {
    closeSidebar();
  });
});

// Search functionality
const searchInput = document.querySelector('.header-search input');
const searchBtn = document.querySelector('.search-btn');

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    console.log('Searching for:', query);
    // Add your search logic here
  }
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// Update cart count dynamically (example)
function updateCartCount(count) {
  cartBadge.textContent = count;
}

// Example: Update cart when items are added (can be triggered from Cart.js)
window.addEventListener('cartUpdated', (e) => {
  updateCartCount(e.detail.count);
});
