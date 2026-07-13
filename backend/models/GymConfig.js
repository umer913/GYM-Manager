import mongoose from 'mongoose';

const gymConfigSchema = new mongoose.Schema({
  // Use a fixed singleton key so there's always exactly one document
  key: { type: String, default: 'main', unique: true },
  address: { type: String, default: 'CCA Block, Phase 5 DHA, Lahore, Pakistan' },
  latitude: { type: Number, default: 31.4697 },
  longitude: { type: Number, default: 74.2728 },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.GymConfig || mongoose.model('GymConfig', gymConfigSchema);
