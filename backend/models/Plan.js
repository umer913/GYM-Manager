import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, enum: ['1 Month', '3 Months', 'Yearly'], required: true },
  allowsTrainer: { type: Boolean, default: false },
  features: { type: [String], default: [] },
  theme: { type: String, enum: ['normal', 'good', 'very-good'], default: 'normal' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Plan || mongoose.model('Plan', planSchema);
