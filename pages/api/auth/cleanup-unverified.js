import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  await dbConnect();
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  try {
    // OTP cleanup disabled. Keep the old deletion logic commented out.
    // const result = await User.deleteOne({ email, isVerified: false });
    // if (result.deletedCount === 0) {
    //   return res.status(404).json({ success: false, message: 'No unverified user found with this email' });
    // }
    return res.status(200).json({ success: true, message: 'OTP cleanup is disabled' });
  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
