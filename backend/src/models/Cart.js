const { Schema, model } = require('mongoose');

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

module.exports = model('Cart', CartSchema);
