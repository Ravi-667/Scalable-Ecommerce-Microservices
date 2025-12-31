const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const MOCKAPI_BASE = process.env.MOCKAPI_BASE || process.env.MOCKAPI_URL || '';

const router = express.Router();

// Place an order (idempotent if Idempotency-Key header provided)
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const idempotencyKey = req.headers['idempotency-key'] || null;

    if (idempotencyKey) {
      const existing = await Order.findOne({ user: userId, idempotencyKey });
      if (existing) return res.status(200).json(existing);
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product').lean();
    if (!cart || !cart.items || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const items = cart.items.map((it) => ({ product: it.product._id, quantity: it.quantity, price: it.price }));
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);

    const order = new Order({ user: userId, items, total, currency: cart.currency, idempotencyKey });
    await order.save();

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    // Optionally forward order to external MockAPI (non-blocking)
    if (MOCKAPI_BASE) {
      (async () => {
        try {
          await axios.post(`${MOCKAPI_BASE.replace(/\/$/, '')}/orders`, {
            orderId: order._id,
            user: userId,
            items,
            total,
            currency: cart.currency,
            status: order.status,
            createdAt: order.createdAt,
          }, { timeout: 5000 });
        } catch (e) {
          console.warn('MockAPI order forward failed:', e.message);
        }
      })();
    }

    await order.populate('items.product');
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List orders for user
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).populate('items.product').lean();
    res.json({ items: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order by id
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product').lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (simple endpoint — in real app restrict to admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    order.status = status || order.status;
    await order.save();
    await order.populate('items.product');
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
