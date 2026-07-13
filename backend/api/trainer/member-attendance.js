import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import CheckIn from '../../models/CheckIn';
import { authenticate, authorizeRoles } from '../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('trainer')(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }

      const trainerId = req.user.userId;
      const { memberId } = req.query;

      if (!memberId) {
        return res.status(400).json({ success: false, message: 'memberId is required' });
      }

      // Confirm member is assigned to this trainer
      const member = await User.findOne({ _id: memberId, role: 'member', assignedTrainer: trainerId });
      if (!member) {
        return res.status(403).json({ success: false, message: 'Member not assigned to you' });
      }

      // Get last 30 days of check-ins for this member
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const checkIns = await CheckIn.find({
        user: memberId,
        role: 'member',
        checkInTime: { $gte: since },
      }).sort({ checkInTime: -1 });

      // Total ever
      const totalCheckIns = await CheckIn.countDocuments({ user: memberId, role: 'member' });

      return res.status(200).json({
        success: true,
        checkIns,
        totalCheckIns,
        last30Days: checkIns.length,
      });
    });
  });
}
