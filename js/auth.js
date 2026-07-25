/**
 * Authentication - Registration & Login handlers
 */

function showMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = 'message ' + (type || 'error');
  el.style.display = 'block';
}

function hideMessage(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = 'none';
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9]{10}$/.test(phone.replace(/\s/g, ''));
}

function handleRegister(event) {
  event.preventDefault();
  hideMessage('registerMessage');

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const location = document.getElementById('location').value.trim();
  const farmType = document.getElementById('farmType').value;

  if (!name || !email || !phone || !password || !location || !farmType) {
    showMessage('registerMessage', 'Please fill in all fields.', 'error');
    return;
  }
  if (!validateEmail(email)) {
    showMessage('registerMessage', 'Please enter a valid email address.', 'error');
    return;
  }
  if (!validatePhone(phone)) {
    showMessage('registerMessage', 'Please enter a valid 10-digit phone number.', 'error');
    return;
  }
  if (password.length < 6) {
    showMessage('registerMessage', 'Password must be at least 6 characters.', 'error');
    return;
  }
  if (password !== confirmPassword) {
    showMessage('registerMessage', 'Passwords do not match.', 'error');
    return;
  }

  const result = Database.registerUser({ name, email, phone, password, location, farmType });

  if (result.success) {
    showMessage('registerMessage', 'Registration successful! Redirecting to login...', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  } else {
    showMessage('registerMessage', result.message, 'error');
  }
}

function handleLogin(event) {
  event.preventDefault();
  hideMessage('loginMessage');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('loginMessage', 'Please enter email and password.', 'error');
    return;
  }

  const result = Database.loginUser(email, password);

  if (result.success) {
    showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  } else {
    showMessage('loginMessage', result.message, 'error');
  }
}

function handleLogout() {
  Database.logout();
  window.location.href = 'index.html';
}

function requireAuth() {
  if (!Database.isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function redirectIfLoggedIn() {
  if (Database.isLoggedIn()) {
    window.location.href = 'dashboard.html';
  }
}
