const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCKS = import.meta?.env?.VITE_USE_MOCKS === 'true';
const SERVICES = {
  users: import.meta?.env?.VITE_USERS_BASE || 'https://jsonplaceholder.typicode.com',
  products: import.meta?.env?.VITE_PRODUCTS_BASE || 'https://fakestoreapi.com',
  carts: import.meta?.env?.VITE_CARTS_BASE || 'https://dummyjson.com',
  orders: import.meta?.env?.VITE_ORDERS_BASE || import.meta?.env?.VITE_MOCKAPI_BASE || '',
  reviews: import.meta?.env?.VITE_REVIEWS_BASE || 'https://jsonplaceholder.typicode.com',
};

function parseMockToken() {
  try {
    const t = localStorage.getItem('token');
    if (!t) return null;
    // token may be JSON.stringify({id,email}) in mock mode
    if (t.startsWith('{') || t.startsWith('%7B')) {
      return JSON.parse(decodeURIComponent(t));
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, options);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, body };
  return body;
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function authFetch(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return request(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

export const auth = {
  register: async (payload) => {
    if (USE_MOCKS) {
      try {
        const res = await fetch(`${SERVICES.users}/users`);
        const list = await res.json();
        const found = list.find((u) => (u.email || '').toLowerCase() === (payload.email || '').toLowerCase());
        const user = found ? { id: found.id, name: found.name, email: found.email } : { id: Date.now(), name: payload.name, email: payload.email };
        const token = encodeURIComponent(JSON.stringify({ id: user.id, email: user.email }));
        return { token, user };
      } catch (e) {
        const user = { id: Date.now(), name: payload.name, email: payload.email };
        const token = encodeURIComponent(JSON.stringify({ id: user.id, email: user.email }));
        return { token, user };
      }
    }
    return request('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  },
  login: async (payload) => {
    if (USE_MOCKS) {
      try {
        const res = await fetch(`${SERVICES.users}/users`);
        const list = await res.json();
        const found = list.find((u) => (u.email || '').toLowerCase() === (payload.email || '').toLowerCase());
        const user = found ? { id: found.id, name: found.name, email: found.email } : { id: Date.now(), name: payload.email.split('@')[0], email: payload.email };
        const token = encodeURIComponent(JSON.stringify({ id: user.id, email: user.email }));
        return { token, user };
      } catch (e) {
        const user = { id: Date.now(), name: payload.email.split('@')[0], email: payload.email };
        const token = encodeURIComponent(JSON.stringify({ id: user.id, email: user.email }));
        return { token, user };
      }
    }
    return request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  },
};

export const products = {
  list: async (q) => {
    if (USE_MOCKS) {
      const url = `${SERVICES.products}/products${q ? `?limit=20&sort=desc` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      return { items: Array.isArray(data) ? data.map((p) => ({ _id: String(p.id), title: p.title, description: p.description, price: p.price, currency: 'USD', images: p.image ? [p.image] : [], inventory: 0 })) : [], count: Array.isArray(data) ? data.length : 0, page: 1, limit: 20 };
    }
    return request(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  },
  get: async (id) => {
    if (USE_MOCKS) {
      const res = await fetch(`${SERVICES.products}/products/${id}`);
      const p = await res.json();
      return { _id: String(p.id), title: p.title, description: p.description, price: p.price, currency: 'USD', images: p.image ? [p.image] : [], inventory: 0 };
    }
    return request(`/products/${id}`);
  },
  create: (payload) => authFetch('/products', { method: 'POST', body: payload }),
};

export const cart = {
  get: async () => {
    if (USE_MOCKS) {
      const mt = parseMockToken();
      const uid = mt?.id || mt?.email || '1';
      try {
        const res = await fetch(`${SERVICES.carts}/carts/user/${uid}`);
        const data = await res.json();
        if (data && data.carts && data.carts.length) return data.carts[0];
        if (Array.isArray(data) && data.length) return data[0];
        return { items: [] };
      } catch (e) {
        return { items: [] };
      }
    }
    return authFetch('/cart');
  },
  add: async (payload) => {
    if (USE_MOCKS) {
      const mt = parseMockToken();
      const uid = mt?.id || mt?.email || 1;
      try {
        const res = await fetch(`${SERVICES.carts}/carts/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, products: [{ id: payload.productId, quantity: payload.quantity || 1 }] }) });
        return res.json();
      } catch (e) { throw e }
    }
    return authFetch('/cart', { method: 'POST', body: payload });
  },
  removeItem: (itemId) => authFetch(`/cart/item/${itemId}`, { method: 'DELETE' }),
  updateItem: (itemId, payload) => authFetch(`/cart/item/${itemId}`, { method: 'PUT', body: payload }),
  clear: () => authFetch('/cart', { method: 'DELETE' }),
};

export const orders = {
  place: async () => {
    if (USE_MOCKS) {
      const base = SERVICES.orders;
      const mt = parseMockToken();
      const uid = mt?.id || mt?.email || 1;
      if (base) {
        const res = await fetch(`${base}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, status: 'pending', items: [] }) });
        return res.json();
      }
      return { id: Date.now(), user: uid, status: 'pending', items: [] };
    }
    return authFetch('/orders', { method: 'POST' });
  },
  list: () => authFetch('/orders'),
};

export const payments = {
  pay: async (orderId) => {
    if (USE_MOCKS) {
      // simulate a payment success
      return { payment: { method: 'stub', status: 'succeeded', processedAt: new Date().toISOString(), amount: 0 }, orderId, status: 'paid' };
    }
    return authFetch('/payments/pay', { method: 'POST', body: { orderId } });
  },
  getForOrder: (orderId) => authFetch(`/payments/order/${orderId}`),
};

export const reviews = {
  listForProduct: async (productId) => {
    if (USE_MOCKS) {
      const res = await fetch(`${SERVICES.reviews}/comments?postId=${productId}`);
      return res.json();
    }
    return [];
  },
};

export default { request };
