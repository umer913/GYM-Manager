import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: String, default: '' },
  reps: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { _id: false });

const dayPlanSchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  focus: { type: String, default: '' }, // e.g. "Chest & Triceps"
  exercises: { type: [exerciseSchema], default: [] },
  restDay: { type: Boolean, default: false },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  time: { type: String, default: '' }, // e.g. "7:00 AM"
  description: { type: String, default: '' },
}, { _id: false });

const memberPlanSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weeklyPlan: { type: [dayPlanSchema], default: [] },
  dietPlan: {
    calories: { type: String, default: '' },
    protein: { type: String, default: '' },
    carbs: { type: String, default: '' },
    fats: { type: String, default: '' },
    meals: { type: [mealSchema], default: [] },
    notes: { type: String, default: '' },
  },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// One plan per member-trainer pair
memberPlanSchema.index({ member: 1, trainer: 1 }, { unique: true });

export default mongoose.models.MemberPlan || mongoose.model('MemberPlan', memberPlanSchema);
