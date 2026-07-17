import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  description:   { type: String, default: '' },
  price:         { type: Number, required: true },
  category:      { type: String, default: 'General' },
  images:        { type: [String], default: [] },
  stock:         { type: Number, default: 0 },
  expectedDelivery: { type: String, default: '3-5 business days' },
  isActive:      { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
