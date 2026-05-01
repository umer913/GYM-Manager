import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendMail } from '../../../utils/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  await dbConnect();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // Send login notification email
    await sendMail({
      to: user.email,
      subject: 'Login Notification',
      text: `Hello ${user.name}, you have successfully logged in.`,
      html: `<p>Hello <b>${user.name}</b>, you have successfully logged in.</p>`
    });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ success: true, user: { name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
