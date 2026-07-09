import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { authenticate } from '../../../utils/auth';
import { getWorkoutRecommendation, getWorkoutMeta, getDietRecommendation, getDietMeta } from '../../../lib/recommendations';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  authenticate(req, res, async () => {
    try {
      const { type } = req.body; // 'workout' or 'diet'

      if (!type || !['workout', 'diet'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid type. Must be "workout" or "diet"' });
      }

      const user = await User.findById(req.user.userId)
        .select('role')
        .populate('plan', 'name features')
        .populate('assignedTrainer', 'name specialty');

      if (!user || user.role !== 'member') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const specialty = user.assignedTrainer?.specialty || 'General';

      if (type === 'workout') {
        const specialty = user.assignedTrainer?.specialty || 'General';
        // Find the matching program key to extract meta
        const query = specialty.toLowerCase().trim();
        const programKey =
          query.match(/strength|powerlifting|power/i) ? 'strength' :
          query.match(/cardio|running|endurance|hiit/i) ? 'cardio' :
          query.match(/bodybuilding|hypertrophy|muscle|aesthetics/i) ? 'bodybuilding' :
          query.match(/weight loss|fat loss|slim|cut/i) ? 'weightloss' :
          query.match(/yoga|flexibility|mobility/i) ? 'yoga' :
          query.match(/crossfit|functional|wod/i) ? 'crossfit' : 'general';

        const recommendation = getWorkoutRecommendation(specialty);
        const meta = getWorkoutMeta(programKey);
        return res.status(200).json({ success: true, type, recommendation, meta, basedOn: specialty });
      }

      if (type === 'diet') {
        const planName  = user.plan?.name || '';
        const features  = user.plan?.features || [];
        const recommendation = getDietRecommendation(planName, features);
        const meta = getDietMeta(planName, features);
        return res.status(200).json({ success: true, type, recommendation, meta, basedOn: planName || 'General' });
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
}
