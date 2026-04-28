const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const loginCard = document.getElementById('loginCard');
const dashboard = document.getElementById('dashboard');
const adminName = document.getElementById('adminName');
const logoutBtn = document.getElementById('logoutBtn');
const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
const panels = Array.from(document.querySelectorAll('.tab-panel'));

const tokenKey = 'adminToken';

function setActiveTab(tab) {
  tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
  panels.forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${tab}`));
}

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(tokenKey, token);
  } else {
    localStorage.removeItem(tokenKey);
  }
}

async function adminFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : ''
  };

  const response = await fetch(`${window.API_BASE || 'http://localhost:4000/api'}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Request failed');
  }

  return response.json();
}

async function loadPanel(tab) {
  const panel = document.getElementById(`tab-${tab}`);
  panel.innerHTML = '<p>Loading...</p>';

  try {
    const data = await adminFetch(`/admin/${tab}`);
    panel.innerHTML = renderTable(tab, data);

    if (tab === 'products') {
      panel.prepend(renderProductForm());
      wireProductForm(panel);
    }

    if (tab === 'categories') {
      panel.prepend(renderCategoryForm());
      wireCategoryForm(panel);
    }
  } catch (error) {
    panel.innerHTML = `<p>${error.message}</p>`;
  }
}

function renderTable(tab, rows) {
  if (!rows || !rows.length) {
    return '<p>No records found.</p>';
  }

  const headers = Object.keys(rows[0]);
  const headerRow = headers.map((h) => `<th>${h}</th>`).join('');
  const bodyRows = rows
    .map((row) => {
      const cols = headers.map((h) => {
        const value = Array.isArray(row[h]) ? JSON.stringify(row[h]) : row[h];
        return `<td>${value ?? ''}</td>`;
      }).join('');
      return `<tr>${cols}</tr>`;
    })
    .join('');

  return `
    <table class="table">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}

function renderProductForm() {
  return `
    <h3>New product</h3>
    <form id="productForm" class="form-grid">
      <input name="name" placeholder="Name" required>
      <input name="sku" placeholder="SKU" required>
      <input name="price" placeholder="Price" type="number" step="0.01" required>
      <input name="imageUrl" placeholder="Image URL">
      <input name="categorySlug" placeholder="Category slug">
      <input name="isActive" placeholder="Active (true/false)">
      <textarea name="description" placeholder="Description" rows="2"></textarea>
      <div class="form-actions">
        <button class="primary-btn" type="submit">Create</button>
      </div>
    </form>
  `;
}

function renderCategoryForm() {
  return `
    <h3>New category</h3>
    <form id="categoryForm" class="form-grid">
      <input name="name" placeholder="Name" required>
      <input name="slug" placeholder="Slug" required>
      <div class="form-actions">
        <button class="primary-btn" type="submit">Create</button>
      </div>
    </form>
  `;
}

function wireProductForm(panel) {
  const form = panel.querySelector('#productForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);
    payload.isActive = payload.isActive ? payload.isActive === 'true' : true;

    try {
      await adminFetch('/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadPanel('products');
    } catch (error) {
      alert(error.message);
    }
  });
}

function wireCategoryForm(panel) {
  const form = panel.querySelector('#categoryForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);

    try {
      await adminFetch('/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadPanel('categories');
    } catch (error) {
      alert(error.message);
    }
  });
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginStatus.textContent = '';

  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData);

  try {
    const response = await window.apiFetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setToken(response.token);
    adminName.textContent = response.adminName;
    loginCard.classList.add('hidden');
    dashboard.classList.remove('hidden');
    await loadPanel('rfq');
  } catch (error) {
    loginStatus.textContent = error.message;
  }
});

logoutBtn.addEventListener('click', async () => {
  const token = getToken();
  if (token) {
    try {
      await adminFetch('/admin/logout', { method: 'POST' });
    } catch (error) {
      // ignore
    }
  }

  setToken(null);
  loginCard.classList.remove('hidden');
  dashboard.classList.add('hidden');
  adminName.textContent = 'Signed out';
});

tabButtons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const tab = btn.dataset.tab;
    setActiveTab(tab);
    await loadPanel(tab);
  });
});

const existingToken = getToken();
if (existingToken) {
  loginCard.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadPanel('rfq');
}
