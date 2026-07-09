import mongoose from 'mongoose';

// ── Subdocuments used only for role: 'member' ──────────────────────────────────

const exerciseSchema = new mongoose.Schema({
  name:  { type: String, default: '' },
  sets:  { type: String, default: '' },
  reps:  { type: String, default: '' },
  notes: { type: String, default: '' },
}, { _id: false });

const dayPlanSchema = new mongoose.Schema({
  day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
  focus:     { type: String, default: '' },
  exercises: { type: [exerciseSchema], default: [] },
  restDay:   { type: Boolean, default: false },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  time:        { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const dietPlanSchema = new mongoose.Schema({
  calories: { type: String, default: '' },
  protein:  { type: String, default: '' },
  carbs:    { type: String, default: '' },
  fats:     { type: String, default: '' },
  meals:    { type: [mealSchema], default: [] },
  notes:    { type: String, default: '' },
}, { _id: false });

// ──────────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String, required: true },
  role:     { type: String, enum: ['member', 'trainer', 'Manager'], default: 'member' },

  // ── Trainer-only fields ──────────────────────────────────────────────────
  specialty: { type: String, default: 'General' },
  timings:   { type: String, default: 'Morning (06:00 AM - 11:00 AM)' },

  // ── Member-only fields ───────────────────────────────────────────────────
  plan:               { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  assignedTrainer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  membershipStatus:   { type: String, enum: ['active', 'inactive'], default: 'active' },
  membershipExpiresAt:{ type: Date },

  // Weekly workout plan — set by trainer, applies to member only
  weeklyWorkoutPlan: { type: [dayPlanSchema], default: undefined },

  // Weekly diet plan — set by trainer, applies to member only
  weeklyDietPlan: { type: dietPlanSchema, default: undefined },

  // Plan metadata — tracks when trainer last updated the plans
  planUpdatedAt:  { type: Date },
  planUpdatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // trainer's _id

  // ── Auth fields (all roles) ──────────────────────────────────────────────
  createdAt:  { type: Date, default: Date.now },
  otp:        { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
});

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', userSchema);
