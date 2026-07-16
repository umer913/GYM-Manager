import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import Plan from '../../models/Plan';
import { authenticate, authorizeRoles } from '../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('member')(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }

      try {
        const { trainerId } = req.body;
        if (!trainerId) {
          return res.status(400).json({ success: false, message: 'Trainer ID is required' });
        }

        const member = await User.findById(req.user.userId).populate('plan');
        if (!member || member.role !== 'member') {
          return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const plan = member.plan ? await Plan.findById(member.plan._id) : null;
        const isExpired = !!(member.membershipExpiresAt && new Date(member.membershipExpiresAt) < new Date());
        if (!plan || !plan.allowsTrainer || member.membershipStatus !== 'active' || isExpired) {
          return res.status(403).json({ success: false, message: 'Your current plan does not allow trainer selection. Please subscribe to a trainer-enabled plan created by the admin.' });
        }

        const trainer = await User.findById(trainerId);
        if (!trainer || trainer.role !== 'trainer') {
          return res.status(404).json({ success: false, message: 'Trainer not found' });
        }

        member.assignedTrainer = trainer._id;

        // Clear trainer-assigned plans when switching to a new trainer
        member.weeklyWorkoutPlan = undefined;
        member.weeklyDietPlan    = undefined;
        member.planUpdatedAt     = undefined;
        member.planUpdatedBy     = undefined;

        await member.save();

        const updatedMember = await User.findById(member._id)
          .select('-password')
          .populate('plan')
          .populate('assignedTrainer');

        return res.status(200).json({
          success: true,
          message: 'Trainer assigned successfully',
          member: updatedMember
        });
      } catch (error) {
        console.error('Assign trainer error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
      }
    });
  });
}