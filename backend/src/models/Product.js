const { Schema, model } = require('mongoose');

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    images: [{ type: String }],
    sku: { type: String, trim: true },
    inventory: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = model('Product', ProductSchema);
