import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: { type: String, required: true },
  role: { type: String, enum: ['member', 'Manager'], default: 'member' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  membershipStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
  membershipExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
