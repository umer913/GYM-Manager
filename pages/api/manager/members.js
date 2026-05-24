import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { authenticate, authorizeRoles } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('Manager')(req, res, async () => {
      try {
        const members = await User.find({ role: 'member' })
          .select('-password')
          .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, members });
      } catch (error) {
        console.error('Fetch members error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
      }
    });
  });
}
