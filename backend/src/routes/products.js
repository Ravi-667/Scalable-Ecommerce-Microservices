const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// List products with optional search and pagination
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(limit, 10);
    const [items, count] = await Promise.all([
      Product.find(filter).skip(skip).limit(parseInt(limit, 10)).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ items, count, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { title, price, description, currency, images, sku, inventory } = req.body;
    
    // Input validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    
    const p = new Product({
      title: title.trim(),
      description: description?.trim() || '',
      price,
      currency: currency || 'USD',
      images: Array.isArray(images) ? images : [],
      sku: sku?.trim() || '',
      inventory: inventory || 0,
    });
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Invalid data' });
  }
});

// Update product (admin only)
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    // Only allow specific fields to be updated
    const allowedFields = ['title', 'description', 'price', 'currency', 'images', 'sku', 'inventory'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    const p = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Invalid data' });
  }
});

// Delete product (admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
