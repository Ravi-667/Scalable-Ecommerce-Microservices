/**
 * API Service - Frontend API Communication
 * 
 * This module handles all API calls.
 * Authentication is now handled by Clerk - tokens are managed externally.
 * 
 * MODE: MOCK SERVICES ENABLED
 * Using public APIs as data sources:
 * - Products: https://fakestoreapi.com
 * - Carts: localStorage (persistent)
 * - Users: Clerk Authentication
 * - Reviews: https://jsonplaceholder.typicode.com
 */

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

// MOCK MODE: Defaults to true in development, set VITE_USE_MOCKS=false to use real backend
const USE_MOCKS = import.meta?.env?.VITE_USE_MOCKS !== 'false';

// Mock service base URLs
const SERVICES = {
  users: 'https://jsonplaceholder.typicode.com',
  products: 'https://fakestoreapi.com',
  carts: 'https://dummyjson.com',
  reviews: 'https://jsonplaceholder.typicode.com',
};

// ============ Clerk Token Integration ============
// Note: Token management is now handled by Clerk
// Use useAuth().getToken() in components that need the token

// Legacy compatibility functions - now Clerk manages auth state
export function getToken() {
  // Clerk manages tokens - this is kept for backward compatibility
  // Components should use useAuth() hook instead
  return localStorage.getItem('clerk-token-cache');
}

export function setToken(token) {
  // Clerk manages tokens automatically
  localStorage.setItem('clerk-token-cache', token);
}

export function clearToken() {
  localStorage.removeItem('clerk-token-cache');
}

export function logout() {
  clearToken();
  localStorage.removeItem('mockCart');
  localStorage.removeItem('mockOrders');
  // Note: Use Clerk's signOut() in components instead
  window.location.href = '/sign-in';
}

// ============ Auth Service ============
// For backward compatibility - use Clerk hooks in components when possible

export const auth = {
  getMe: async (token) => {
    if (USE_MOCKS) {
      // Return mock user data - in real app this would come from Clerk
      return { user: { name: 'Mock User', email: 'user@example.com', createdAt: new Date().toISOString() } };
    }
    return authFetch('/auth/me', { token });
  },
  
  login: async (email, password) => {
    if (USE_MOCKS) {
      // Mock login - store token in localStorage
      const mockToken = 'mock_token_' + Date.now();
      setToken(mockToken);
      return { token: mockToken, user: { name: 'Mock User', email } };
    }
    const result = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (result.token) setToken(result.token);
    return result;
  },
  
  register: async (name, email, password) => {
    if (USE_MOCKS) {
      const mockToken = 'mock_token_' + Date.now();
      setToken(mockToken);
      return { token: mockToken, user: { name, email } };
    }
    const result = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (result.token) setToken(result.token);
    return result;
  }
};

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

export function authFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return request(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

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
