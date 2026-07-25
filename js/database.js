/**
 * AgriFarm Database - JavaScript localStorage database
 * Stores users, crops, listings, and session data in the browser
 */

const DB_KEYS = {
  users: 'agri_farm_users',
  session: 'agri_farm_session',
  crops: 'agri_farm_crops',
  cropsMeta: 'agri_farm_crops_meta',
  listings: 'agri_farm_listings'
};

const Database = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  init() {
    if (!this.get(DB_KEYS.users)) {
      this.set(DB_KEYS.users, []);
    }
    const cropsMeta = this.get(DB_KEYS.cropsMeta);
    if (!this.get(DB_KEYS.crops) || !cropsMeta || cropsMeta.version !== GOOGLE_CONFIG.CROPS_DATA_VERSION) {
      this.set(DB_KEYS.crops, GOOGLE_CROPS_DATA);
      this.set(DB_KEYS.cropsMeta, { version: GOOGLE_CONFIG.CROPS_DATA_VERSION, source: 'Google Agriculture Data' });
    }
    if (!this.get(DB_KEYS.listings)) {
      this.set(DB_KEYS.listings, []);
    }
  },

  getUsers() {
    return this.get(DB_KEYS.users) || [];
  },

  saveUsers(users) {
    this.set(DB_KEYS.users, users);
  },

  findUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  registerUser(userData) {
    const users = this.getUsers();
    if (this.findUserByEmail(userData.email)) {
      return { success: false, message: 'Email already registered. Please login.' };
    }
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      location: userData.location,
      farmType: userData.farmType,
      registeredAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveUsers(users);
    return { success: true, user: newUser };
  },

  loginUser(email, password) {
    const user = this.findUserByEmail(email);
    if (!user) {
      return { success: false, message: 'No account found with this email.' };
    }
    if (user.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }
    const session = { id: user.id, email: user.email, name: user.name, loginAt: new Date().toISOString() };
    this.set(DB_KEYS.session, session);
    return { success: true, user: session };
  },

  logout() {
    localStorage.removeItem(DB_KEYS.session);
  },

  getSession() {
    return this.get(DB_KEYS.session);
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const user = this.getUsers().find(u => u.id === session.id);
    return user || null;
  },

  getCrops() {
    return this.get(DB_KEYS.crops) || GOOGLE_CROPS_DATA;
  },

  saveCrops(crops, source) {
    this.set(DB_KEYS.crops, crops);
    this.set(DB_KEYS.cropsMeta, {
      version: GOOGLE_CONFIG.CROPS_DATA_VERSION,
      source: source || 'Google Agriculture Data',
      updatedAt: new Date().toISOString()
    });
  },

  getCropsMeta() {
    return this.get(DB_KEYS.cropsMeta) || { source: 'Google Agriculture Data' };
  },

  getListings() {
    return this.get(DB_KEYS.listings) || [];
  },

  addListing(listing) {
    const listings = this.getListings();
    const newListing = {
      id: Date.now().toString(),
      ...listing,
      createdAt: new Date().toISOString()
    };
    listings.unshift(newListing);
    this.set(DB_KEYS.listings, listings);
    return newListing;
  },

  deleteListing(id, userId) {
    const listings = this.getListings();
    const listing = listings.find(l => l.id === id);
    if (!listing || listing.userId !== userId) return false;
    this.set(DB_KEYS.listings, listings.filter(l => l.id !== id));
    return true;
  }
};

Database.init();
