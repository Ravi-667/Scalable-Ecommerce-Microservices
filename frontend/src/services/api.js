/**
 * API Service - Frontend API Communication
 * 
 * This module handles all API calls.
 * 
 * MODE: MOCK SERVICES ENABLED
 * Using public APIs as data sources:
 * - Products: https://fakestoreapi.com
 * - Carts: https://dummyjson.com
 * - Users: https://jsonplaceholder.typicode.com
 * - Reviews: https://jsonplaceholder.typicode.com
 */

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

// MOCK MODE: Set to true to use public mock APIs instead of backend
const USE_MOCKS = true; // Enabled for development with mock services

// Mock service base URLs
const SERVICES = {
  users: 'https://jsonplaceholder.typicode.com',
  products: 'https://fakestoreapi.com',
  carts: 'https://dummyjson.com',
  reviews: 'https://jsonplaceholder.typicode.com',
};

// ============ Token Management ============

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function logout() {
  clearToken();
  localStorage.removeItem('mockUser');
  window.location.href = '/login';
}

// Get current mock user from localStorage
function getMockUser() {
  try {
    const user = localStorage.getItem('mockUser');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// ============ Core Request Functions ============

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, options);
    const body = await res.json().catch(() => null);
    if (!res.ok) throw { status: res.status, body };
    return body;
  } catch (err) {
    if (err.status) throw err;
    throw { status: 0, body: { error: 'Network error - is the backend running?' } };
  }
}

export function authFetch(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return request(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

// ============ Auth Service ============

export const auth = {
  register: async (payload) => {
    if (USE_MOCKS) {
      // Create a mock user and store in localStorage
      const user = { 
        _id: `user_${Date.now()}`, 
        name: payload.name, 
        email: payload.email,
        createdAt: new Date().toISOString()
      };
      const token = btoa(JSON.stringify({ id: user._id, email: user.email }));
      localStorage.setItem('mockUser', JSON.stringify(user));
      return { token, user };
    }
    return request('/auth/register', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
  },

  login: async (payload) => {
    if (USE_MOCKS) {
      // Fetch users from JSONPlaceholder and find matching email
      try {
        const res = await fetch(`${SERVICES.users}/users`);
        const users = await res.json();
        const found = users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
        
        const user = found 
          ? { _id: `user_${found.id}`, name: found.name, email: found.email, createdAt: new Date().toISOString() }
          : { _id: `user_${Date.now()}`, name: payload.email.split('@')[0], email: payload.email, createdAt: new Date().toISOString() };
        
        const token = btoa(JSON.stringify({ id: user._id, email: user.email }));
        localStorage.setItem('mockUser', JSON.stringify(user));
        return { token, user };
      } catch {
        // Fallback if JSONPlaceholder fails
        const user = { _id: `user_${Date.now()}`, name: payload.email.split('@')[0], email: payload.email, createdAt: new Date().toISOString() };
        const token = btoa(JSON.stringify({ id: user._id, email: user.email }));
        localStorage.setItem('mockUser', JSON.stringify(user));
        return { token, user };
      }
    }
    return request('/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
  },

  getMe: async () => {
    if (USE_MOCKS) {
      const user = getMockUser();
      if (!user) throw { status: 401, body: { error: 'Not authenticated' } };
      return { user };
    }
    return authFetch('/auth/me');
  },
};

// ============ Product Service (FakeStoreAPI) ============

export const products = {
  list: async (q) => {
    if (USE_MOCKS) {
      const res = await fetch(`${SERVICES.products}/products`);
      const data = await res.json();
      
      let items = Array.isArray(data) ? data.map(p => ({ 
        _id: String(p.id), 
        title: p.title, 
        description: p.description, 
        price: p.price, 
        currency: 'USD', 
        images: p.image ? [p.image] : [],
        category: p.category,
        rating: p.rating,
        inventory: Math.floor(Math.random() * 50) + 10
      })) : [];
      
      // Filter by search query if provided
      if (q) {
        const query = q.toLowerCase();
        items = items.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
        );
      }
      
      return { items, count: items.length, page: 1, limit: 20 };
    }
    return request(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  },

  get: async (id) => {
    if (USE_MOCKS) {
      const res = await fetch(`${SERVICES.products}/products/${id}`);
      const p = await res.json();
      return { 
        _id: String(p.id), 
        title: p.title, 
        description: p.description, 
        price: p.price, 
        currency: 'USD', 
        images: p.image ? [p.image] : [],
        category: p.category,
        rating: p.rating,
        inventory: Math.floor(Math.random() * 50) + 10
      };
    }
    return request(`/products/${id}`);
  },

  getByCategory: async (category) => {
    if (USE_MOCKS) {
      const res = await fetch(`${SERVICES.products}/products/category/${category}`);
      const data = await res.json();
      const items = data.map(p => ({
        _id: String(p.id),
        title: p.title,
        description: p.description,
        price: p.price,
        currency: 'USD',
        images: p.image ? [p.image] : [],
        category: p.category,
        rating: p.rating,
        inventory: Math.floor(Math.random() * 50) + 10
      }));
      return { items };
    }
    return request(`/products?category=${category}`);
  },

  getCategories: async () => {
    if (USE_MOCKS) {
      const res = await fetch(`${SERVICES.products}/products/categories`);
      return res.json();
    }
    return request('/products/categories');
  },

  create: (payload) => authFetch('/products', { method: 'POST', body: payload }),
  update: (id, payload) => authFetch(`/products/${id}`, { method: 'PUT', body: payload }),
  delete: (id) => authFetch(`/products/${id}`, { method: 'DELETE' }),
};

// ============ Cart Service (localStorage + DummyJSON structure) ============

// We'll use localStorage to persist cart since DummyJSON doesn't persist data
function getLocalCart() {
  try {
    const cart = localStorage.getItem('mockCart');
    return cart ? JSON.parse(cart) : { items: [] };
  } catch {
    return { items: [] };
  }
}

function saveLocalCart(cart) {
  localStorage.setItem('mockCart', JSON.stringify(cart));
}

export const cart = {
  get: async () => {
    if (USE_MOCKS) {
      return getLocalCart();
    }
    return authFetch('/cart');
  },

  add: async (payload) => {
    if (USE_MOCKS) {
      const cart = getLocalCart();
      
      // Fetch product details
      let product;
      try {
        const res = await fetch(`${SERVICES.products}/products/${payload.productId}`);
        const p = await res.json();
        product = {
          _id: String(p.id),
          title: p.title,
          images: p.image ? [p.image] : [],
          price: p.price
        };
      } catch {
        product = { _id: payload.productId, title: 'Product', images: [], price: 0 };
      }

      // Check if item already exists
      const existingIdx = cart.items.findIndex(i => i.product._id === payload.productId);
      
      if (existingIdx >= 0) {
        cart.items[existingIdx].quantity += payload.quantity || 1;
      } else {
        cart.items.push({
          _id: `item_${Date.now()}`,
          product,
          quantity: payload.quantity || 1,
          price: product.price
        });
      }
      
      saveLocalCart(cart);
      return cart;
    }
    return authFetch('/cart', { method: 'POST', body: payload });
  },

  removeItem: async (itemId) => {
    if (USE_MOCKS) {
      const cart = getLocalCart();
      cart.items = cart.items.filter(i => i._id !== itemId);
      saveLocalCart(cart);
      return cart;
    }
    return authFetch(`/cart/item/${itemId}`, { method: 'DELETE' });
  },
  
  updateItem: async (itemId, payload) => {
    if (USE_MOCKS) {
      const cart = getLocalCart();
      const item = cart.items.find(i => i._id === itemId);
      if (item && payload.quantity) {
        item.quantity = payload.quantity;
      }
      saveLocalCart(cart);
      return cart;
    }
    return authFetch(`/cart/item/${itemId}`, { method: 'PUT', body: payload });
  },
  
  clear: async () => {
    if (USE_MOCKS) {
      saveLocalCart({ items: [] });
      return { success: true };
    }
    return authFetch('/cart', { method: 'DELETE' });
  },
};

// ============ Order Service (localStorage) ============

function getLocalOrders() {
  try {
    const orders = localStorage.getItem('mockOrders');
    return orders ? JSON.parse(orders) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders) {
  localStorage.setItem('mockOrders', JSON.stringify(orders));
}

export const orders = {
  place: async () => {
    if (USE_MOCKS) {
      const cart = getLocalCart();
      if (!cart.items || cart.items.length === 0) {
        throw { status: 400, body: { error: 'Cart is empty' } };
      }

      const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const order = {
        _id: `order_${Date.now()}`,
        items: cart.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        currency: 'USD',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save order to localStorage
      const orders = getLocalOrders();
      orders.unshift(order);
      saveLocalOrders(orders);

      // Clear cart
      saveLocalCart({ items: [] });

      return order;
    }
    return authFetch('/orders', { method: 'POST' });
  },

  list: async () => {
    if (USE_MOCKS) {
      const items = getLocalOrders();
      return { items };
    }
    return authFetch('/orders');
  },

  get: async (id) => {
    if (USE_MOCKS) {
      const orders = getLocalOrders();
      const order = orders.find(o => o._id === id);
      if (!order) throw { status: 404, body: { error: 'Order not found' } };
      return order;
    }
    return authFetch(`/orders/${id}`);
  },

  updateStatus: (id, status) => authFetch(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
};

// ============ Payment Service (Mock) ============

export const payments = {
  pay: async (orderId) => {
    if (USE_MOCKS) {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update order status in localStorage
      const orders = getLocalOrders();
      const order = orders.find(o => o._id === orderId);
      if (order) {
        order.status = 'paid';
        order.payment = {
          method: 'card',
          status: 'succeeded',
          processedAt: new Date().toISOString(),
          amount: order.total
        };
        saveLocalOrders(orders);
      }

      return { 
        payment: { method: 'card', status: 'succeeded', processedAt: new Date().toISOString() }, 
        orderId, 
        status: 'paid' 
      };
    }
    return authFetch('/payments/pay', { method: 'POST', body: { orderId } });
  },

  getForOrder: (orderId) => authFetch(`/payments/order/${orderId}`),
};

// ============ Reviews Service (JSONPlaceholder) ============

export const reviews = {
  listForProduct: async (productId) => {
    if (USE_MOCKS) {
      // Use JSONPlaceholder comments as mock reviews
      // Map productId to a postId (1-100)
      const postId = (parseInt(productId, 10) % 100) + 1;
      const res = await fetch(`${SERVICES.reviews}/comments?postId=${postId}`);
      const comments = await res.json();
      
      return comments.map(c => ({
        _id: `review_${c.id}`,
        productId,
        author: c.name,
        email: c.email,
        content: c.body,
        rating: Math.floor(Math.random() * 2) + 4, // Random 4-5 star
        createdAt: new Date().toISOString()
      }));
    }
    return [];
  },
};

export default { request, authFetch };
