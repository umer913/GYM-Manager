import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  specialty: { type: String, default: 'General' },
  timings: { type: String, default: 'Morning (06:00 AM - 11:00 AM)' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Trainer || mongoose.model('Trainer', trainerSchema);
