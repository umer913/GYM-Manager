import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import Plan from '../../models/Plan';
import Trainer from '../../models/Trainer';
import { authenticate, authorizeRoles } from '../../utils/auth';

function getSubscriptionState(member) {
  const hasPlan = !!member.plan;
  const expiresAt = member.membershipExpiresAt ? new Date(member.membershipExpiresAt) : null;
  const isExpired = !!(expiresAt && expiresAt < new Date());
  const isActive = hasPlan && member.membershipStatus === 'active' && !isExpired;

  return { hasPlan, expiresAt, isExpired, isActive };
}

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

            const normalizedMembers = members.map((member) => {
              const { hasPlan, expiresAt, isExpired, isActive } = getSubscriptionState(member);
              return {
                ...member.toObject(),
                subscriptionStatus: !hasPlan ? 'none' : isExpired ? 'expired' : isActive ? 'active' : 'inactive',
                subscriptionLabel: !hasPlan ? 'No Plan' : isExpired ? 'Expired' : 'Subscribed',
                subscriptionExpiresAt: expiresAt,
                subscriptionBadge: hasPlan
                  ? {
                      label: member.plan?.allowsTrainer ? 'Premium' : 'Standard',
                      icon: member.plan?.allowsTrainer ? '👑' : '💳',
                    }
                  : null,
              };
            });

            return res.status(200).json({ success: true, members: normalizedMembers });
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
                member.membershipStatus = 'inactive';
              } else {
                const plan = await Plan.findById(planId);
                if (!plan) {
                  return res.status(404).json({ success: false, message: 'Plan not found' });
                }
                member.plan = planId;
                member.membershipStatus = 'active';

                // Subscriptions expire after 30 days and require resubscribe.
                const now = new Date();
                now.setDate(now.getDate() + 30);
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

            const { hasPlan, expiresAt, isExpired, isActive } = getSubscriptionState(updatedMember);

            return res.status(200).json({
              success: true,
              message: 'Member updated successfully',
              member: {
                ...updatedMember.toObject(),
                subscriptionStatus: !hasPlan ? 'none' : isExpired ? 'expired' : isActive ? 'active' : 'inactive',
                subscriptionLabel: !hasPlan ? 'No Plan' : isExpired ? 'Expired' : 'Subscribed',
                subscriptionExpiresAt: expiresAt,
                subscriptionBadge: hasPlan
                  ? {
                      label: updatedMember.plan?.allowsTrainer ? 'Premium' : 'Standard',
                      icon: updatedMember.plan?.allowsTrainer ? '👑' : '💳',
                    }
                  : null,
              }
            });
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
