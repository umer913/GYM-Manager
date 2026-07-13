import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
// import { sendMail } from '../../utils/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  await dbConnect();
  const { name, email, password, phone } = req.body;
  const normalizedEmail = email?.toLowerCase();
  const normalizedRole = 'member';

  if (!name || !normalizedEmail || !password || !phone) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // OTP flow disabled. Keep the old logic commented for reference.
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: 'member',
      isVerified: true
    });

    // OTP email disabled.
    // await sendMail({
    //   to: user.email,
    //   subject: 'Verify your Gym Management System account',
    //   text: `Hello ${user.name}, your OTP is: ${otp}`,
    //   html: `<p>Hello <b>${user.name}</b>, your OTP is: <b>${otp}</b></p>`
    // });
    return res.status(201).json({ success: true, message: 'Signup successful. You can log in immediately.' });
  } catch (error) {
    // if (normalizedRole === 'trainer') {
    //   await Promise.allSettled([
    //     User.deleteOne({ email: normalizedEmail, isVerified: false }),
    //     Trainer.deleteOne({ email: normalizedEmail }),
    //   ]);
    // }
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
