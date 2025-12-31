const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const notify = require('../utils/notification');

const router = express.Router();

// Simulated payment processing endpoint
// POST /api/payments/pay { orderId, method, amount }
router.post('/pay', auth, async (req, res) => {
  try {
    const { orderId, method } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'orderId required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });

    // Simulate processing delay and success
    const success = true;
    const paymentRecord = {
      method: method || 'stub',
      status: success ? 'succeeded' : 'failed',
      processedAt: new Date(),
      amount: order.total,
    };

    order.payment = paymentRecord;
    order.status = success ? 'paid' : 'pending';
    await order.save();

    // send notification (stub)
    notify.sendNotification(order.user, 'payment', { orderId: order._id, status: order.status }).catch(() => {});

    res.json({ payment: paymentRecord, orderId: order._id, status: order.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch payment for an order
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    res.json({ payment: order.payment || null, status: order.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
