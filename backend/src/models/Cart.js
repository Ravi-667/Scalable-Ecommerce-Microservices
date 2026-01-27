const { Schema, model } = require('mongoose');

const CartItemSchema = new Schema({
  product: { type: String, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true, min: 0 },
  title: { type: String }, // Snapshot for Hybrid Mode
  image: { type: String }, // Snapshot for Hybrid Mode
});

const CartSchema = new Schema(
  {
    user: { type: String, required: true, unique: true }, // Changed to String for Clerk ID support
    items: [CartItemSchema],
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

module.exports = model('Cart', CartSchema);
