const { Schema, model } = require('mongoose');

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
