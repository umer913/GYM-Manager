import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { authenticate } from '../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, async () => {
    const { method } = req;
    const userId = req.user.userId;

    switch (method) {
      case 'GET':
        try {
          const user = await User.findById(userId).select('-password');
          if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
          }
          return res.status(200).json({ success: true, user });
        } catch (error) {
          console.error('Fetch profile error:', error);
          return res.status(500).json({ success: false, message: 'Server error', error: error.message });
        }

      case 'PUT':
        try {
          const { name, email, phone, currentPassword, newPassword } = req.body;
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
          }

          // Email change check
          if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const emailExists = await User.findOne({ email: email.toLowerCase() });
            if (emailExists) {
              return res.status(400).json({ success: false, message: 'Email is already in use by another account.' });
            }
            user.email = email.toLowerCase();
          }

          // Profile fields update
          if (name) user.name = name;
          if (phone) user.phone = phone;

          // Password change check
          if (newPassword) {
            if (!currentPassword) {
              return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
              return res.status(400).json({ success: false, message: 'Incorrect current password.' });
            }
            // Hash and set new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
          }

          await user.save();

          const updatedUser = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt
          };

          return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: updatedUser
          });
        } catch (error) {
          console.error('Update profile error:', error);
          return res.status(500).json({ success: false, message: 'Server error', error: error.message });
        }

      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  });
}
