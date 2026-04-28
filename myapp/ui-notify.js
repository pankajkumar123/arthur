(() => {
  const DEFAULT_TIMEOUT = 4000;

  function ensureStack() {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function showNotice(message, type = 'info', options = {}) {
    if (!message) {
      return;
    }

    const stack = ensureStack();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icon = document.createElement('span');
    icon.textContent = type === 'success' ? '✓' : type === 'error' ? '!' : 'i';

    const content = document.createElement('div');

    const title = document.createElement('div');
    title.className = 'toast__title';
    title.textContent = type === 'success' ? 'Success' : type === 'error' ? 'Action needed' : 'Note';

    const body = document.createElement('div');
    body.className = 'toast__message';
    body.textContent = message;

    content.appendChild(title);
    content.appendChild(body);

    const close = document.createElement('button');
    close.className = 'toast__close';
    close.type = 'button';
    close.textContent = '×';
    close.addEventListener('click', () => toast.remove());

    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(close);

    stack.appendChild(toast);

    const timeout = options.timeout ?? DEFAULT_TIMEOUT;
    if (timeout > 0) {
      setTimeout(() => toast.remove(), timeout);
    }
  }

  window.showNotice = showNotice;
})();
