import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import CheckIn from '../../../models/CheckIn';
import { authenticate, authorizeRoles } from '../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('trainer')(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }

      try {
        const account = await User.findById(req.user.userId).select('-password');
        if (!account) {
          return res.status(404).json({ success: false, message: 'Account not found' });
        }

        if (account.role !== 'trainer') {
          return res.status(403).json({ success: false, message: 'Trainer access denied' });
        }

        const trainerProfile = account;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const assignedMembers = await User.find({ role: 'member', assignedTrainer: trainerProfile._id })
          .select('-password')
          .populate('plan')
          .populate('planUpdatedBy', 'name')
          .sort({ createdAt: -1 });

        const todayCheckIns = await CheckIn.find({
          trainer: trainerProfile._id,
          checkInTime: { $gte: startOfToday, $lte: endOfToday }
        }).sort({ checkInTime: -1 });

        const weekCheckIns = [];
        for (let offset = 6; offset >= 0; offset -= 1) {
          const dayStart = new Date();
          dayStart.setDate(dayStart.getDate() - offset);
          dayStart.setHours(0, 0, 0, 0);

          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const count = await CheckIn.countDocuments({
            trainer: trainerProfile._id,
            checkInTime: { $gte: dayStart, $lte: dayEnd }
          });

          weekCheckIns.push(count);
        }

        const recentMembers = assignedMembers.slice(0, 4).map((member) => ({
          _id: member._id,
          name: member.name,
          plan: member.plan?.name || 'No Plan',
          status: member.membershipStatus,
        }));

        return res.status(200).json({
          success: true,
          trainer: {
            ...trainerProfile.toObject(),
          },
          account: {
            name: account.name,
            email: account.email,
            role: account.role,
          },
          assignedMembers,
          recentMembers,
          todayCheckIns,
          weekCheckIns,
          totals: {
            assignedMembers: assignedMembers.length,
            todayCheckIns: todayCheckIns.length,
            weeklyCheckIns: weekCheckIns.reduce((sum, value) => sum + value, 0),
          }
        });
      } catch (error) {
        console.error('Trainer dashboard error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
      }
    });
  });
}