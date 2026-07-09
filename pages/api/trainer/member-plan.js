import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { authenticate, authorizeRoles } from '../../../utils/auth';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_WEEKLY = DAYS.map((day) => ({ day, focus: '', exercises: [], restDay: false }));
const EMPTY_DIET = { calories: '', protein: '', carbs: '', fats: '', meals: [], notes: '' };

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('trainer')(req, res, async () => {
      const trainerId = req.user.userId;

      // Verify trainer exists
      const trainer = await User.findById(trainerId);
      if (!trainer || trainer.role !== 'trainer') {
        return res.status(403).json({ success: false, message: 'Trainer not found' });
      }

      // ── GET: fetch plans stored on the member document ──────────────────────
      if (req.method === 'GET') {
        const { memberId } = req.query;
        if (!memberId) {
          return res.status(400).json({ success: false, message: 'memberId is required' });
        }

        const member = await User.findOne({ _id: memberId, role: 'member', assignedTrainer: trainerId });
        if (!member) {
          return res.status(403).json({ success: false, message: 'Member not assigned to you' });
        }

        return res.status(200).json({
          success: true,
          plan: {
            weeklyPlan: member.weeklyWorkoutPlan?.length === 7
              ? member.weeklyWorkoutPlan
              : EMPTY_WEEKLY,
            dietPlan: member.weeklyDietPlan || EMPTY_DIET,
            planUpdatedAt: member.planUpdatedAt || null,
          },
        });
      }

      // ── POST: save plans into the member's User document ────────────────────
      if (req.method === 'POST') {
        const { memberId, weeklyPlan, dietPlan } = req.body;
        if (!memberId) {
          return res.status(400).json({ success: false, message: 'memberId is required' });
        }

        const member = await User.findOne({ _id: memberId, role: 'member', assignedTrainer: trainerId });
        if (!member) {
          return res.status(403).json({ success: false, message: 'Member not assigned to you' });
        }

        const updated = await User.findByIdAndUpdate(
          memberId,
          {
            $set: {
              weeklyWorkoutPlan: weeklyPlan,
              weeklyDietPlan: dietPlan,
              planUpdatedAt: new Date(),
              planUpdatedBy: trainerId,
            },
          },
          { new: true, select: '-password' }
        );

        return res.status(200).json({
          success: true,
          message: 'Plan saved successfully',
          planUpdatedAt: updated.planUpdatedAt,
        });
      }

      return res.status(405).json({ success: false, message: 'Method not allowed' });
    });
  });
}
