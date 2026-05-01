import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['member', 'trainer'], default: 'member' },
  createdAt: { type: Date, default: Date.now },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
