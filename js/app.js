/**
 * AgriFarm - Common app utilities and page setup
 */

function updateNav() {
  const navAuth = document.getElementById('navAuth');
  if (!navAuth) return;

  if (Database.isLoggedIn()) {
    const user = Database.getSession();
    navAuth.innerHTML = `
      <span class="nav-user">Hello, ${user.name.split(' ')[0]}</span>
      <a href="dashboard.html" class="btn btn-outline btn-sm">Dashboard</a>
      <button onclick="handleLogout()" class="btn btn-primary btn-sm">Logout</button>
    `;
  } else {
    navAuth.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }
}

function setActiveNav(page) {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });
}

function loadDashboard() {
  requireAuth();
  const user = Database.getCurrentUser();
  if (!user) {
    handleLogout();
    return;
  }

  document.getElementById('userName').textContent = user.name;
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userPhone').textContent = user.phone;
  document.getElementById('userLocation').textContent = user.location;
  document.getElementById('userFarmType').textContent = user.farmType;
  document.getElementById('userRegistered').textContent = new Date(user.registeredAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const listings = Database.getListings().filter(l => l.userId === user.id);
  document.getElementById('listingCount').textContent = listings.length;
  document.getElementById('cropCount').textContent = Database.getCrops().length;

  const myListingsEl = document.getElementById('myListings');
  if (myListingsEl) {
    if (listings.length === 0) {
      myListingsEl.innerHTML = '<p class="empty-text">No listings yet. <a href="marketplace.html">Add your first listing</a></p>';
    } else {
      myListingsEl.innerHTML = listings.slice(0, 3).map(l => `
        <div class="listing-mini">
          <strong>${l.cropName}</strong> — ${l.quantity} ${l.unit} @ ₹${l.price}/${l.unit}
        </div>
      `).join('');
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function renderCropCards(crops) {
  const grid = document.getElementById('cropsGrid');
  if (!grid) return;

  if (crops.length === 0) {
    grid.innerHTML = '<p class="empty-text full-width">No crops match your search.</p>';
    return;
  }

  grid.innerHTML = crops.map(crop => `
    <div class="crop-card">
      <div class="crop-card-header">
        <div class="crop-icon">${getCropIcon(crop.name)}</div>
        <span class="crop-badge">${escapeHtml(crop.season)}</span>
      </div>
      <h3>${escapeHtml(crop.name)}</h3>
      <div class="crop-details">
        <p><strong>Water:</strong> ${escapeHtml(crop.water)}</p>
        <p><strong>Soil:</strong> ${escapeHtml(crop.soil)}</p>
        <p><strong>Temperature:</strong> ${escapeHtml(crop.temperature)}</p>
        <p><strong>Rainfall:</strong> ${escapeHtml(crop.rainfall)}</p>
        <p><strong>Yield:</strong> ${escapeHtml(crop.yield)}</p>
        <p><strong>Production:</strong> ${escapeHtml(crop.production)}</p>
        <p><strong>Major Regions:</strong> ${escapeHtml(crop.region)}</p>
      </div>
      <p class="crop-tip">${escapeHtml(crop.tips)}</p>
      <p class="crop-source">📊 Source: ${escapeHtml(crop.source)}</p>
      <button class="btn btn-outline btn-sm google-btn" onclick="openCropGoogleSearch('${crop.id}')">
        🔍 Search on Google
      </button>
    </div>
  `).join('');
}

function getCropIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('rice')) return '🍚';
  if (n.includes('wheat')) return '🌾';
  if (n.includes('cotton')) return '☁️';
  if (n.includes('sugarcane')) return '🎋';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('maize') || n.includes('corn')) return '🌽';
  if (n.includes('soybean')) return '🫘';
  if (n.includes('groundnut')) return '🥜';
  if (n.includes('potato')) return '🥔';
  if (n.includes('mustard')) return '🌼';
  return '🌱';
}

let allCropsCache = [];

async function loadCrops() {
  const grid = document.getElementById('cropsGrid');
  const sourceEl = document.getElementById('cropDataSource');
  const countEl = document.getElementById('cropCountBadge');
  if (!grid) return;

  grid.innerHTML = '<div class="loading-state full-width"><div class="spinner"></div><p>Loading crop data from Google sources...</p></div>';

  const result = await GoogleCropsService.loadCrops();
  allCropsCache = result.crops;

  if (sourceEl) sourceEl.textContent = result.source;
  if (countEl) countEl.textContent = `${result.crops.length} crops loaded`;

  renderCropCards(allCropsCache);
}

function filterCrops() {
  const query = (document.getElementById('cropSearch')?.value || '').toLowerCase().trim();
  if (!query) {
    renderCropCards(allCropsCache);
    return;
  }
  const filtered = allCropsCache.filter(crop =>
    crop.name.toLowerCase().includes(query) ||
    crop.season.toLowerCase().includes(query) ||
    crop.region.toLowerCase().includes(query) ||
    crop.soil.toLowerCase().includes(query)
  );
  renderCropCards(filtered);
}

async function refreshCropData() {
  const btn = document.getElementById('refreshCropsBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Refreshing...';
  }
  await loadCrops();
  if (btn) {
    btn.disabled = false;
    btn.textContent = '🔄 Refresh Data';
  }
}

function openCropGoogleSearch(id) {
  const crop = allCropsCache.find(c => c.id === id);
  if (crop) {
    GoogleCropsService.openGoogleSearch(crop.googleQuery || `${crop.name} cultivation India`);
  }
}

function loadMarketplace() {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;

  const listings = Database.getListings();
  if (listings.length === 0) {
    grid.innerHTML = '<p class="empty-text full-width">No produce listed yet. Be the first to add a listing!</p>';
    return;
  }

  grid.innerHTML = listings.map(listing => {
    const canDelete = Database.isLoggedIn() && Database.getSession().id === listing.userId;
    return `
      <div class="listing-card">
        <div class="listing-header">
          <h3>${listing.cropName}</h3>
          <span class="price">₹${listing.price}/${listing.unit}</span>
        </div>
        <p class="listing-qty">${listing.quantity} ${listing.unit} available</p>
        <p class="listing-seller">Seller: ${listing.sellerName}</p>
        <p class="listing-location">📍 ${listing.location}</p>
        ${listing.description ? `<p class="listing-desc">${listing.description}</p>` : ''}
        ${canDelete ? `<button class="btn btn-danger btn-sm" onclick="deleteListing('${listing.id}')">Remove</button>` : ''}
      </div>
    `;
  }).join('');
}

function handleAddListing(event) {
  event.preventDefault();
  if (!Database.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  const user = Database.getCurrentUser();
  const cropName = document.getElementById('cropName').value.trim();
  const quantity = document.getElementById('quantity').value;
  const unit = document.getElementById('unit').value;
  const price = document.getElementById('price').value;
  const description = document.getElementById('description').value.trim();
  const msgEl = document.getElementById('listingMessage');

  if (!cropName || !quantity || !price) {
    msgEl.textContent = 'Please fill required fields.';
    msgEl.className = 'message error';
    msgEl.style.display = 'block';
    return;
  }

  Database.addListing({
    cropName,
    quantity: parseFloat(quantity),
    unit,
    price: parseFloat(price),
    description,
    sellerName: user.name,
    userId: user.id,
    location: user.location
  });

  msgEl.textContent = 'Listing added successfully!';
  msgEl.className = 'message success';
  msgEl.style.display = 'block';
  document.getElementById('listingForm').reset();
  loadMarketplace();
}

function deleteListing(id) {
  const userId = Database.getSession().id;
  if (Database.deleteListing(id, userId)) {
    loadMarketplace();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNav();
});
