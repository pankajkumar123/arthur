const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const submitBtn = loginForm.querySelector('button[type="submit"]');
const loginBtnText = document.getElementById('loginBtnText');
const loginBtnSpinner = document.getElementById('loginBtnSpinner');
const togglePasswordBtn = document.getElementById('toggleLoginPassword');
const passwordInput = document.getElementById('loginPassword');

function setStatus(message, isError) {
  loginStatus.textContent = message;
  loginStatus.style.color = isError ? '#b42318' : '#2d8f5b';
  if (!isError) {
    loginStatus.style.background = 'rgba(45, 143, 91, 0.1)';
    loginStatus.style.padding = '12px';
  } else {
    loginStatus.style.background = 'rgba(180, 35, 24, 0.1)';
    loginStatus.style.padding = '12px';
  }
}

// Password visibility toggle
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    const icon = togglePasswordBtn.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
  });
}

// Check if already logged in
if (localStorage.getItem('customerToken')) {
  window.location.href = 'TopRowbanner.html';
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginStatus.textContent = '';

  const formData = new FormData(loginForm);
  const data = Object.fromEntries(formData);

  if (!data.email.trim() || !data.password) {
    setStatus('Please enter both email and password.', true);
    return;
  }

  submitBtn.disabled = true;
  loginBtnText.style.display = 'none';
  loginBtnSpinner.style.display = 'inline';

  try {
    const response = await window.apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email.trim().toLowerCase(),
        password: data.password
      })
    });

    // Store JWT token and user info
    localStorage.setItem('customerToken', response.token);
    localStorage.setItem('customerName', response.user.fullName);
    localStorage.setItem('customerEmail', response.user.email);
    localStorage.setItem('customerId', response.user.id);
    localStorage.setItem('userRole', response.user.role || 'customer');
    
    setStatus('✓ Signed in successfully! Redirecting...', false);
    
    setTimeout(() => {
      window.location.href = 'TopRowbanner.html';
    }, 1000);
  } catch (error) {
    setStatus(error.message || 'Invalid email or password.', true);
    submitBtn.disabled = false;
    loginBtnText.style.display = 'inline';
    loginBtnSpinner.style.display = 'none';
  }
});
