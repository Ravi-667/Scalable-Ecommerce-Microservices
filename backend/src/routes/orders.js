const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

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

    // HYBRID MODE: Do not populate because products are not in MongoDB
    // cart.items[i].product is the String ID
    const cart = await Cart.findOne({ user: userId }).lean();
    if (!cart || !cart.items || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    console.log('Creating order from cart:', JSON.stringify(cart));

    // Fix: Use it.product directly (it is the ID string in Hybrid mode)
    // Also ensuring price is number, and copying snapshot data
    const items = cart.items.map((it) => ({ 
        product: it.product,  // Use the ID string
        quantity: it.quantity, 
        price: it.price,
        title: it.title,
        image: it.image
    }));
    
    // Calculate total from cart prices
    const total = items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity)), 0);

    const order = new Order({ user: userId, items, total, currency: cart.currency, idempotencyKey });
    await order.save();

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    
    console.log('Order created:', order._id);

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

    // Do not populate response either
    res.status(201).json(order);
  } catch (err) {
    console.error('Order Create Error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// List orders for user
router.get('/', auth, async (req, res) => {
  try {
    // No populate in Hybrid mode
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    
    // Transform to match frontend expectation (item.product.title)
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
           _id: item.product,
           title: item.title || 'Product',
           images: item.image ? [item.image] : [],
           price: item.price
        }
      }))
    }));

    res.json({ items: formattedOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order by id
router.get('/:id', auth, async (req, res) => {
  try {
    // No populate in Hybrid mode
    let order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    
    // Transform
    order = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
           _id: item.product,
           title: item.title || 'Product',
           images: item.image ? [item.image] : [],
           price: item.price
        }
      }))
    };

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', auth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.status = status;
    await order.save();
    await order.populate('items.product');
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
