/**
 * API Service Module
 * Handles all API calls to the backend
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// User management
const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('user');

// Check if user is logged in
const isLoggedIn = () => !!getToken();
const isAdmin = () => getUser()?.role === 'admin';

// Base fetch wrapper with auth
const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// =============================================
// AUTH API
// =============================================
const authAPI = {
    register: async (userData) => {
        const response = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        if (response.success) {
            setToken(response.data.token);
            setUser(response.data.user);
        }
        return response;
    },

    login: async (email, password) => {
        const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (response.success) {
            setToken(response.data.token);
            setUser(response.data.user);
        }
        return response;
    },

    logout: () => {
        removeToken();
        removeUser();
        window.location.href = '/frontend/index.html';
    },

    getProfile: () => apiFetch('/auth/profile'),

    updateProfile: (data) => apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

// =============================================
// PRODUCTS API
// =============================================
const productsAPI = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiFetch(`/products${queryString ? '?' + queryString : ''}`);
    },

    getById: (id) => apiFetch(`/products/${id}`),

    getFeatured: () => apiFetch('/products/featured'),

    getBrands: () => apiFetch('/products/brands'),

    create: (productData) => apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
    }),

    update: (id, productData) => apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
    }),

    delete: (id) => apiFetch(`/products/${id}`, {
        method: 'DELETE'
    })
};

// =============================================
// CATEGORIES API
// =============================================
const categoriesAPI = {
    getAll: () => apiFetch('/categories'),

    getById: (id) => apiFetch(`/categories/${id}`),

    create: (data) => apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiFetch(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiFetch(`/categories/${id}`, {
        method: 'DELETE'
    })
};

// =============================================
// BATCHES API
// =============================================
const batchesAPI = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiFetch(`/batches${queryString ? '?' + queryString : ''}`);
    },

    getExpiring: (days = 30) => apiFetch(`/batches/expiring?days=${days}`),

    getExpired: () => apiFetch('/batches/expired'),

    checkStock: (productId) => apiFetch(`/batches/check/${productId}`),

    getDashboardStats: () => apiFetch('/batches/dashboard-stats'),

    create: (data) => apiFetch('/batches', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiFetch(`/batches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiFetch(`/batches/${id}`, {
        method: 'DELETE'
    }),

    updateInventory: (batchId, quantity) => apiFetch(`/batches/inventory/${batchId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
    })
};

// =============================================
// CART API
// =============================================
const cartAPI = {
    get: () => apiFetch('/cart'),

    add: (productId, quantity = 1) => apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity })
    }),

    update: (itemId, quantity) => apiFetch(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
    }),

    remove: (itemId) => apiFetch(`/cart/${itemId}`, {
        method: 'DELETE'
    }),

    clear: () => apiFetch('/cart', {
        method: 'DELETE'
    })
};

// =============================================
// ORDERS API
// =============================================
const ordersAPI = {
    create: (orderData) => apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    }),

    getUserOrders: () => apiFetch('/orders/my-orders'),

    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiFetch(`/orders${queryString ? '?' + queryString : ''}`);
    },

    getById: (id) => apiFetch(`/orders/${id}`),

    updateStatus: (id, status) => apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    })
};

// =============================================
// REVIEWS API
// =============================================
const reviewsAPI = {
    getByProduct: (productId) => apiFetch(`/reviews/product/${productId}`),

    create: (productId, rating, comment) => apiFetch(`/reviews/product/${productId}`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
    }),

    delete: (reviewId) => apiFetch(`/reviews/${reviewId}`, {
        method: 'DELETE'
    })
};

// =============================================
// WISHLIST API
// =============================================
const wishlistAPI = {
    getAll: () => apiFetch('/wishlist'),

    getIds: () => apiFetch('/wishlist/ids'),

    count: () => apiFetch('/wishlist/count'),

    toggle: (productId) => apiFetch(`/wishlist/toggle/${productId}`, {
        method: 'POST'
    }),

    add: (productId) => apiFetch(`/wishlist/${productId}`, {
        method: 'POST'
    }),

    remove: (productId) => apiFetch(`/wishlist/${productId}`, {
        method: 'DELETE'
    })
};

// =============================================
// COUPONS API
// =============================================
const couponsAPI = {
    validate: (code, orderAmount) => apiFetch('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, orderAmount })
    }),

    getActive: () => apiFetch('/coupons/active'),

    getAll: () => apiFetch('/coupons'),

    create: (data) => apiFetch('/coupons', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiFetch(`/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiFetch(`/coupons/${id}`, {
        method: 'DELETE'
    })
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Format currency VND
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Format date
const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
};

// Calculate days until expiry
const daysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Show toast notification
const showToast = (message, type = 'success') => {
    const container = document.querySelector('.toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const createToastContainer = () => {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
};

// Show/hide loading
const showLoading = () => {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
};

const hideLoading = () => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
};

// Update cart badge
const updateCartBadge = async () => {
    try {
        if (!isLoggedIn()) {
            const badge = document.querySelector('.cart-badge');
            if (badge) badge.textContent = '0';
            return;
        }

        const response = await cartAPI.get();
        const badge = document.querySelector('.cart-badge');
        if (badge && response.success) {
            badge.textContent = response.data.itemCount || 0;
        }
    } catch (error) {
        console.error('Error updating cart badge:', error);
    }
};

// Check auth status and update UI
const checkAuthStatus = () => {
    const user = getUser();
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');

    if (authButtons && userMenu) {
        if (user) {
            authButtons.style.display = 'none';
            userMenu.style.display = 'flex';
            const userName = userMenu.querySelector('.user-name');
            if (userName) userName.textContent = user.name;

            // Show admin link if user is admin
            const adminLink = document.getElementById('adminLink');
            if (adminLink) {
                adminLink.style.display = user.role === 'admin' ? 'flex' : 'none';
            }
        } else {
            authButtons.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }
};

// Export all
window.API = {
    auth: authAPI,
    products: productsAPI,
    categories: categoriesAPI,
    batches: batchesAPI,
    cart: cartAPI,
    orders: ordersAPI,
    reviews: reviewsAPI,
    coupons: couponsAPI,
    wishlist: wishlistAPI
};

window.Utils = {
    formatCurrency,
    formatDate,
    daysUntilExpiry,
    showToast,
    showLoading,
    hideLoading,
    updateCartBadge,
    checkAuthStatus,
    isLoggedIn,
    isAdmin,
    getUser,
    getToken
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    updateCartBadge();
});
