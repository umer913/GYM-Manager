import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:     [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String },
    price:    { type: Number },
    quantity: { type: Number, default: 1 },
    image:    { type: String },
  }],
  totalAmount: { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: { type: String, default: '' },
  contactPhone:   { type: String, default: '' },
  notes:          { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
