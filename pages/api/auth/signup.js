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
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      otp,
      otpExpires,
      isVerified: false
    });
    // Send OTP email
    await sendMail({
      to: user.email,
      subject: 'Verify your Gym Management System account',
      text: `Hello ${user.name}, your OTP is: ${otp}`,
      html: `<p>Hello <b>${user.name}</b>, your OTP is: <b>${otp}</b></p>`
    });
    return res.status(201).json({ success: true, message: 'Signup successful. Please verify your email with the OTP sent.' });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
