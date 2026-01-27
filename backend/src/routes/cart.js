const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Get current user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).lean();
    if (!cart) {
      return res.json({ items: [] });
    }
    
    // HYBRID MODE: Transform stored snapshots into frontend-ready object
    const formattedCart = {
      ...cart,
      items: cart.items.map(item => ({
        ...item,
        // Vital: structure matches what frontend expects (populated product)
        product: {
          _id: item.product, // The ID string
          title: item.title || 'Product',
          images: item.image ? [item.image] : [],
          price: item.price,
          category: 'General' 
        }
      }))
    };
    
    res.json(formattedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart (or update quantity if exists)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Cart POST received body:', JSON.stringify(req.body));
    console.log('User from auth:', req.user);

    const { productId, quantity = 1, product: productData } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });

    let productInfo;
    
    if (productData) {
      console.log('Using product data from frontend');
      productInfo = {
        _id: productId,
        title: productData.title,
        price: productData.price,
        images: productData.images || [],
        category: productData.category
      };
    } else {
      console.log('Searching MongoDB for product:', productId);
      // Validate ObjectId before finding to prevent CastError
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(productId)) {
           console.log('Invalid MongoDB ID, and no product data provided.');
           return res.status(404).json({ error: 'Product not found (Invalid ID)' });
      }

      const product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(404).json({ error: 'Product not found. Please provide product data.' });
      }
      productInfo = product;
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const idx = cart.items.findIndex((i) => String(i.product) === String(productId));
    const imageToSave = (productInfo.images && productInfo.images.length > 0) ? productInfo.images[0] : (productInfo.image || '');
    
    if (idx >= 0) {
      cart.items[idx].quantity += Number(quantity);
      // Update snapshot if available
      if (productInfo.title) cart.items[idx].title = productInfo.title;
      if (imageToSave) cart.items[idx].image = imageToSave;
    } else {
      cart.items.push({ 
        product: productId, 
        quantity: Number(quantity), 
        price: productInfo.price,
        title: productInfo.title,
        image: imageToSave
      });
    }

    await cart.save();
    
    const populatedCart = {
      ...cart.toObject(),
      items: cart.items.map(item => ({
        ...item.toObject(),
        product: item.product === productId ? productInfo : item.product
      }))
    };
    
    console.log('Cart saved successfully');
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error('Cart Route Error Detail:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Update item quantity
router.put('/item/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/item/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.remove();
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
