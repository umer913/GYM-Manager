import dbConnect from '../../lib/mongodb';
import CheckIn from '../../models/CheckIn';
import User from '../../models/User';
import { authenticate, authorizeRoles } from '../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('Manager')(req, res, async () => {
      const { method } = req;

      // Define today's boundaries in local/server time
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      switch (method) {
        case 'GET':
          try {
            const checkIns = await CheckIn.find({
              checkInTime: { $gte: startOfToday, $lte: endOfToday }
            })
              .populate('user', '-password')
              .populate('trainer', '-password')
              .sort({ checkInTime: -1 });

            return res.status(200).json({ success: true, checkIns });
          } catch (error) {
            console.error('Fetch check-ins error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'POST':
          try {
            const { id, role } = req.body;
            if (!id || !role) {
              return res.status(400).json({ success: false, message: 'ID and role are required' });
            }

            if (role !== 'member' && role !== 'trainer') {
              return res.status(400).json({ success: false, message: 'Invalid role' });
            }

            // Check if already checked in today
            const query = {
              role,
              checkInTime: { $gte: startOfToday, $lte: endOfToday }
            };
            if (role === 'member') {
              query.user = id;
            } else {
              query.trainer = id;
            }

            const existing = await CheckIn.findOne(query);
            if (existing) {
              return res.status(400).json({ success: false, message: `${role === 'member' ? 'Member' : 'Trainer'} has already checked in today.` });
            }

            let name = '';
            let userRef = null;
            let trainerRef = null;

            if (role === 'member') {
              const member = await User.findById(id);
              if (!member || member.role !== 'member') {
                return res.status(404).json({ success: false, message: 'Member not found' });
              }
              name = member.name;
              userRef = member._id;
            } else {
              const trainer = await User.findById(id);
              if (!trainer || trainer.role !== 'trainer') {
                return res.status(404).json({ success: false, message: 'Trainer not found' });
              }
              name = trainer.name;
              trainerRef = trainer._id;
            }

            const checkIn = await CheckIn.create({
              user: userRef,
              trainer: trainerRef,
              name,
              role,
              checkInTime: new Date()
            });

            const populatedCheckIn = await CheckIn.findById(checkIn._id)
              .populate('user', '-password')
              .populate('trainer', '-password');

            return res.status(201).json({ success: true, message: 'Checked in successfully', checkIn: populatedCheckIn });
          } catch (error) {
            console.error('Create check-in error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'DELETE':
          try {
            const { id: checkInId } = req.query;
            if (!checkInId) {
              return res.status(400).json({ success: false, message: 'Check-in ID is required' });
            }

            const checkIn = await CheckIn.findById(checkInId);
            if (!checkIn) {
              return res.status(404).json({ success: false, message: 'Check-in record not found' });
            }

            await CheckIn.findByIdAndDelete(checkInId);
            return res.status(200).json({ success: true, message: 'Check-in canceled successfully' });
          } catch (error) {
            console.error('Delete check-in error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        default:
          return res.status(405).json({ success: false, message: 'Method not allowed' });
      }
    });
  });
}
