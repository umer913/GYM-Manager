import dbConnect from '../../../lib/mongodb';
import CheckIn from '../../../models/CheckIn';
import { authenticate, authorizeRoles } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('trainer')(req, res, async () => {
      try {
        const trainerId = req.user.userId;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        // All check-ins this month
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth   = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const monthlyCheckIns = await CheckIn.find({
          trainer: trainerId,
          role: 'trainer',
          checkInTime: { $gte: startOfMonth, $lte: endOfMonth },
        }).sort({ checkInTime: -1 });

        // Total all-time
        const totalCheckIns = await CheckIn.countDocuments({ trainer: trainerId, role: 'trainer' });

        // Week grid (Mon–Sun of current week)
        const currentDay = now.getDay();
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() + distanceToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const weekCheckIns = await CheckIn.find({
          trainer: trainerId,
          role: 'trainer',
          checkInTime: { $gte: startOfWeek, $lt: endOfWeek },
        });

        const weekAttendance = [false, false, false, false, false, false, false];
        weekCheckIns.forEach((ci) => {
          let dayIdx = new Date(ci.checkInTime).getDay() - 1;
          if (dayIdx === -1) dayIdx = 6;
          weekAttendance[dayIdx] = true;
        });

        return res.status(200).json({
          success: true,
          checkInDates: monthlyCheckIns.map((c) => c.checkInTime),
          totalCheckIns,
          weekAttendance,
          monthlyCount: monthlyCheckIns.length,
        });
      } catch (error) {
        console.error('Trainer attendance error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
      }
    });
  });
}
