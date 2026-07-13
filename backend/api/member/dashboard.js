import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import Plan from '../../models/Plan';
import CheckIn from '../../models/CheckIn';
import { authenticate } from '../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, async () => {
    const { method } = req;
    const userId = req.user.userId;

    if (method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
      const user = await User.findById(userId)
        .select('-password')
        .populate('plan')
        .populate('assignedTrainer');

      if (!user) {
        return res.status(404).json({ success: false, message: 'Member profile not found' });
      }

      const now = new Date();
      const subscriptionExpired = !!(user.plan && user.membershipExpiresAt && new Date(user.membershipExpiresAt) < now);
      if (subscriptionExpired && user.membershipStatus !== 'inactive') {
        user.membershipStatus = 'inactive';
        await user.save();
      }

      // Calculate total check-ins count
      const totalCheckIns = await CheckIn.countDocuments({ user: userId });

      const allTrainers = await User.find({ role: 'trainer' })
        .select('-password')
        .sort({ createdAt: -1 });
      const allPlans = await Plan.find({}).sort({ createdAt: 1 });

      // Calculate days remaining
      let daysRemaining = 0;
      if (user.membershipStatus === 'active' && user.membershipExpiresAt) {
        const diffTime = new Date(user.membershipExpiresAt) - new Date();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      // Calculate weekly attendance grid (Mon-Sun of the current week)
      const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + distanceToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const weeklyCheckIns = await CheckIn.find({
        user: userId,
        checkInTime: { $gte: startOfWeek, $lt: endOfWeek }
      });

      const weekAttendance = [false, false, false, false, false, false, false];
      weeklyCheckIns.forEach(ci => {
        const ciDate = new Date(ci.checkInTime);
        let dayIdx = ciDate.getDay() - 1; // getDay() returns 0 for Sunday, 1 for Monday...
        if (dayIdx === -1) dayIdx = 6; // Sunday is index 6
        if (dayIdx >= 0 && dayIdx < 7) {
          weekAttendance[dayIdx] = true;
        }
      });

      // Query all checkins of the current month for the calendar
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthlyCheckIns = await CheckIn.find({
        user: userId,
        checkInTime: { $gte: startOfMonth, $lte: endOfMonth }
      });
      const checkInDates = monthlyCheckIns.map(ci => ci.checkInTime);

      return res.status(200).json({
        success: true,
        member: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          membershipStatus: user.membershipStatus,
          membershipExpiresAt: user.membershipExpiresAt,
          daysRemaining,
          createdAt: user.createdAt,
          plan: user.plan ? {
            id: user.plan._id,
            name: user.plan.name,
            price: user.plan.price,
            duration: user.plan.duration,
            features: user.plan.features,
            allowsTrainer: user.plan.allowsTrainer
          } : null,
          trainer: user.assignedTrainer ? {
            id: user.assignedTrainer._id,
            name: user.assignedTrainer.name,
            email: user.assignedTrainer.email,
            phone: user.assignedTrainer.phone,
            specialty: user.assignedTrainer.specialty,
            timings: user.assignedTrainer.timings
          } : null
        },
        availableTrainers: allTrainers.map((trainer) => ({
          id: trainer._id,
          name: trainer.name,
          email: trainer.email,
          phone: trainer.phone,
          specialty: trainer.specialty,
          timings: trainer.timings
        })),
        allPlans: allPlans.map((plan) => ({
          id: plan._id,
          name: plan.name,
          price: plan.price,
          duration: plan.duration,
          allowsTrainer: plan.allowsTrainer,
          features: plan.features,
          createdAt: plan.createdAt
        })),
        canChooseTrainer: !!(user.plan && user.plan.allowsTrainer && user.membershipStatus === 'active' && (!user.membershipExpiresAt || new Date(user.membershipExpiresAt) >= now)),
        totalCheckIns,
        weekAttendance,
        checkInDates
      });
    } catch (error) {
      console.error('Member dashboard API error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
}
