import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import Plan from '../../../models/Plan';
import Trainer from '../../../models/Trainer';
import { authenticate, authorizeRoles } from '../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('Manager')(req, res, async () => {
      const { method } = req;

      switch (method) {
        case 'GET':
          try {
            const members = await User.find({ role: 'member' })
              .select('-password')
              .populate('plan')
              .populate('assignedTrainer')
              .sort({ createdAt: -1 });

            return res.status(200).json({ success: true, members });
          } catch (error) {
            console.error('Fetch members error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'PUT':
          try {
            const { memberId, planId, assignedTrainerId, status } = req.body;
            if (!memberId) {
              return res.status(400).json({ success: false, message: 'Member ID is required' });
            }

            const member = await User.findById(memberId);
            if (!member || member.role !== 'member') {
              return res.status(404).json({ success: false, message: 'Member not found' });
            }

            // Update plan if provided
            if (planId !== undefined) {
              if (planId === null || planId === '') {
                member.plan = null;
                member.assignedTrainer = null;
                member.membershipExpiresAt = null;
              } else {
                const plan = await Plan.findById(planId);
                if (!plan) {
                  return res.status(404).json({ success: false, message: 'Plan not found' });
                }
                member.plan = planId;

                // Calculate expiry date
                const now = new Date();
                if (plan.duration === '1 Month') {
                  now.setMonth(now.getMonth() + 1);
                } else if (plan.duration === '3 Months') {
                  now.setMonth(now.getMonth() + 3);
                } else if (plan.duration === 'Yearly') {
                  now.setFullYear(now.getFullYear() + 1);
                } else {
                  // Fallback duration: 30 days
                  now.setDate(now.getDate() + 30);
                }
                member.membershipExpiresAt = now;
              }
            }

            // Update assigned trainer if provided
            if (assignedTrainerId !== undefined) {
              if (assignedTrainerId === null || assignedTrainerId === '') {
                member.assignedTrainer = null;
              } else {
                // Verify trainer exists
                const trainer = await Trainer.findById(assignedTrainerId);
                if (!trainer) {
                  return res.status(404).json({ success: false, message: 'Trainer not found' });
                }
                member.assignedTrainer = assignedTrainerId;
              }
            }

            // Update status if provided
            if (status) {
              member.membershipStatus = status;
            }

            await member.save();

            // Populate updated member data
            const updatedMember = await User.findById(memberId)
              .select('-password')
              .populate('plan')
              .populate('assignedTrainer');

            return res.status(200).json({ success: true, message: 'Member updated successfully', member: updatedMember });
          } catch (error) {
            console.error('Update member error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        default:
          return res.status(405).json({ success: false, message: 'Method not allowed' });
      }
    });
  });
}
