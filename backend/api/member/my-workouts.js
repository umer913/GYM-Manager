import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import { authenticate } from '../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  authenticate(req, res, async () => {
    try {
      const user = await User.findById(req.user.userId)
        .select('-password')
        .populate('plan')
        .populate('assignedTrainer', '-password')
        .populate('planUpdatedBy', 'name specialty');

      if (!user || user.role !== 'member') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      return res.status(200).json({
        success: true,
        weeklyWorkoutPlan: user.weeklyWorkoutPlan || [],
        weeklyDietPlan: user.weeklyDietPlan || null,
        planUpdatedAt: user.planUpdatedAt || null,
        planUpdatedBy: user.planUpdatedBy || null,
        trainer: user.assignedTrainer
          ? {
              name: user.assignedTrainer.name,
              specialty: user.assignedTrainer.specialty,
              timings: user.assignedTrainer.timings,
            }
          : null,
        member: {
          name: user.name,
          plan: user.plan?.name || null,
          membershipStatus: user.membershipStatus,
        },
      });
    } catch (error) {
      console.error('My workouts API error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
}
