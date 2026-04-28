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

const categoryButtons = document.querySelectorAll('.category-list button');
const selectedCategory = document.getElementById('selectedCategory');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('siteSearch');
const searchSuggestions = document.getElementById('searchSuggestions');

const suggestions = [
  'Office chairs',
  'Safety gloves',
  'Packaging tape',
  'Cleaning supplies',
  'Power drills',
  'Measurement tools'
];

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedCategory.textContent = button.dataset.category;
  });
});

function renderSuggestions(filterText = '') {
  const items = suggestions.filter((item) => item.toLowerCase().includes(filterText.toLowerCase()));
  searchSuggestions.innerHTML = '';

  if (!items.length) {
    searchSuggestions.classList.remove('show');
    return;
  }

  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item;
    button.addEventListener('click', () => {
      searchInput.value = item;
      searchSuggestions.classList.remove('show');
    });
    searchSuggestions.appendChild(button);
  });

  searchSuggestions.classList.add('show');
}

searchInput.addEventListener('input', (event) => {
  renderSuggestions(event.target.value);
});

searchInput.addEventListener('focus', () => {
  renderSuggestions(searchInput.value);
});

document.addEventListener('click', (event) => {
  if (!searchForm.contains(event.target)) {
    searchSuggestions.classList.remove('show');
  }
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchSuggestions.classList.remove('show');
});

let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const carousel = document.querySelector('.carousel-container');
const heroBadges = document.querySelector('.hero-badges');

function showSlide(index) {
  slides.forEach((slide) => slide.classList.remove('active'));
  dots.forEach((dot) => dot.classList.remove('active'));

  slides[index].classList.add('active');
  dots[index].classList.add('active');
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slides.length;
  showSlide(currentSlideIndex);
}

let autoScroll = setInterval(nextSlide, 5000);

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const index = Number(dot.dataset.slide);
    currentSlideIndex = index;
    showSlide(index);
    clearInterval(autoScroll);
    autoScroll = setInterval(nextSlide, 5000);
  });
});

carousel.addEventListener('mouseenter', () => clearInterval(autoScroll));
carousel.addEventListener('mouseleave', () => {
  autoScroll = setInterval(nextSlide, 5000);
});

if (heroBadges) {
  requestAnimationFrame(() => {
    heroBadges.classList.add('animate');
  });
}

const featuredSection = document.querySelector('.featured-section');
if (featuredSection) {
  const track = featuredSection.querySelector('.featured-track');
  const cards = Array.from(featuredSection.querySelectorAll('.featured-card'));
  const prevBtn = featuredSection.querySelector('[data-action="prev"]');
  const nextBtn = featuredSection.querySelector('[data-action="next"]');
  let index = 0;

  function getCardSize() {
    if (!cards.length) {
      return 0;
    }
    const cardWidth = cards[0].getBoundingClientRect().width;
    return cardWidth + 16;
  }

  function updateFeatured() {
    const cardSize = getCardSize();
    if (!cardSize) {
      return;
    }
    const visibleCount = Math.max(1, Math.floor(track.parentElement.offsetWidth / cardSize));
    const maxIndex = Math.max(0, cards.length - visibleCount);
    index = Math.min(index, maxIndex);
    track.style.transform = `translateX(${-index * cardSize}px)`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= maxIndex;
  }

  prevBtn.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    updateFeatured();
  });

  nextBtn.addEventListener('click', () => {
    index = Math.min(cards.length - 1, index + 1);
    updateFeatured();
  });

  window.addEventListener('resize', updateFeatured);
  updateFeatured();
}
// Deal of the Day Enhanced Timer
function startDealTimer() {
  const hoursEl = document.getElementById('hoursTimer');
  const minutesEl = document.getElementById('minutesTimer');
  const secondsEl = document.getElementById('secondsTimer');
  
  if (!hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

startDealTimer();

// Deal Carousel Navigation
const dealsCarousel = document.querySelector('.deals-carousel');
if (dealsCarousel) {
  const dealsTrack = dealsCarousel.querySelector('.deals-track');
  const leftArrow = dealsCarousel.querySelector('.carousel-arrow.left');
  const rightArrow = dealsCarousel.querySelector('.carousel-arrow.right');

  if (leftArrow && rightArrow) {
    leftArrow.addEventListener('click', () => {
      dealsTrack.scrollBy({
        left: -280,
        behavior: 'smooth'
      });
    });

    rightArrow.addEventListener('click', () => {
      dealsTrack.scrollBy({
        left: 280,
        behavior: 'smooth'
      });
    });

    // Show/hide arrows based on scroll position
    function updateArrows() {
      const scrollLeft = dealsTrack.scrollLeft;
      const maxScroll = dealsTrack.scrollWidth - dealsTrack.clientWidth;

      leftArrow.style.opacity = scrollLeft > 0 ? '1' : '0.3';
      leftArrow.style.pointerEvents = scrollLeft > 0 ? 'auto' : 'none';

      rightArrow.style.opacity = scrollLeft < maxScroll - 5 ? '1' : '0.3';
      rightArrow.style.pointerEvents = scrollLeft < maxScroll - 5 ? 'auto' : 'none';
    }

    dealsTrack.addEventListener('scroll', updateArrows);
    updateArrows();
    window.addEventListener('resize', updateArrows);
  }
}

// Add to Cart functionality for deal cards
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
addToCartButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const card = button.closest('.deal-card');
    const productName = card.querySelector('h3').textContent;
    
    // Visual feedback
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
    button.style.pointerEvents = 'none';
    
    // Animate the card
    card.style.transform = 'translateY(-12px) scale(1.03)';
    
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.style.background = '';
      button.style.pointerEvents = 'auto';
      card.style.transform = '';
    }, 2000);

    // Update cart count
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      const currentCount = parseInt(cartCount.textContent) || 0;
      cartCount.textContent = currentCount + 1;
      
      // Animate cart count
      cartCount.style.animation = 'none';
      setTimeout(() => {
        cartCount.style.animation = 'bounce 0.5s ease';
      }, 10);
    }

    console.log(`Added "${productName}" to cart`);
  });
});

// Add bounce animation for cart count
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }
`;
document.head.appendChild(style);

// Scroll to Top Button Functionality
const scrollToTopBtn = document.getElementById('scrollToTop');

if (scrollToTopBtn) {
  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
  });

  // Scroll to top when clicked
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
