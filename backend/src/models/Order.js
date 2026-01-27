const { Schema, model } = require('mongoose');

const OrderItemSchema = new Schema({
  product: { type: String, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true, min: 0 },
  title: { type: String }, // Snapshot for Hybrid Mode
  image: { type: String }, // Snapshot for Hybrid Mode
});

const OrderSchema = new Schema(
  {
    user: { type: String, required: true }, // Changed to String for Clerk ID support
    items: [OrderItemSchema],
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['pending','paid','processing','shipped','completed','cancelled'], default: 'pending' },
    payment: { type: Schema.Types.Mixed },
    idempotencyKey: { type: String, index: true },
  },
  { timestamps: true }
);

module.exports = model('Order', OrderSchema);
