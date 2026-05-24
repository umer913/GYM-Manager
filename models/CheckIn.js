import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  name: { type: String, required: true },
  role: { type: String, enum: ['member', 'trainer'], required: true },
  checkInTime: { type: Date, default: Date.now }
});

export default mongoose.models.CheckIn || mongoose.model('CheckIn', checkInSchema);
