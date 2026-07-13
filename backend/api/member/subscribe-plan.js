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
        const { planId } = req.body;
        if (!planId) {
          return res.status(400).json({ success: false, message: 'Plan ID is required' });
        }

        const member = await User.findById(req.user.userId).populate('plan').populate('assignedTrainer');
        if (!member || member.role !== 'member') {
          return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
          return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        member.plan = plan._id;
        member.membershipStatus = 'active';

        // Subscriptions always expire after 30 days and require resubscribe.
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        member.membershipExpiresAt = expiresAt;

        // Trainer access is only meaningful on trainer-enabled plans.
        if (!plan.allowsTrainer) {
          member.assignedTrainer = null;
        }

        await member.save();

        const updatedMember = await User.findById(member._id)
          .select('-password')
          .populate('plan')
          .populate('assignedTrainer');

        return res.status(200).json({
          success: true,
          message: `Subscribed to ${plan.name} successfully.`,
          member: {
            ...updatedMember.toObject(),
            plan: updatedMember.plan ? {
              id: updatedMember.plan._id,
              name: updatedMember.plan.name,
              price: updatedMember.plan.price,
              duration: updatedMember.plan.duration,
              features: updatedMember.plan.features,
              allowsTrainer: updatedMember.plan.allowsTrainer,
            } : null,
            trainer: updatedMember.assignedTrainer ? {
              id: updatedMember.assignedTrainer._id,
              name: updatedMember.assignedTrainer.name,
              phone: updatedMember.assignedTrainer.phone,
              specialty: updatedMember.assignedTrainer.specialty,
              timings: updatedMember.assignedTrainer.timings,
            } : null,
          },
          membershipExpiresAt: expiresAt,
          allowsTrainer: plan.allowsTrainer,
        });
      } catch (error) {
        console.error('Subscribe plan error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
      }
    });
  });
}