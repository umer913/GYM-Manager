import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { authenticate, authorizeRoles } from '../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('Manager')(req, res, async () => {
      const { method } = req;
      
      switch (method) {
        case 'GET':
          try {
            const trainers = await User.find({ role: 'trainer' })
              .select('-password')
              .sort({ createdAt: -1 });
            return res.status(200).json({ success: true, trainers });
          } catch (error) {
            console.error('Fetch trainers error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'POST':
          try {
            const { name, email, password, phone, specialty, timings } = req.body;
            const normalizedEmail = email?.toLowerCase();
            if (!name || !normalizedEmail || !password || !phone) {
              return res.status(400).json({ success: false, message: 'Name, email, password, and phone are required' });
            }

            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
              return res.status(409).json({ success: false, message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const trainer = await User.create({
              name,
              email: normalizedEmail,
              password: hashedPassword,
              phone,
              specialty: specialty || 'General',
              timings: timings || 'Morning (06:00 AM - 11:00 AM)',
              role: 'trainer',
              isVerified: true
            });

            return res.status(201).json({ success: true, message: 'Trainer added successfully', trainer });
          } catch (error) {
            console.error('Add trainer error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'PUT':
          try {
            const { id } = req.query;
            const { name, email, password, phone, specialty, timings } = req.body;

            const trainerId = id || req.body._id;
            if (!trainerId) {
              return res.status(400).json({ success: false, message: 'Trainer ID is required' });
            }

            const trainer = await User.findById(trainerId);
            if (!trainer) {
              return res.status(404).json({ success: false, message: 'Trainer not found' });
            }

            if (trainer.role !== 'trainer') {
              return res.status(400).json({ success: false, message: 'Selected user is not a trainer' });
            }

            if (name) trainer.name = name;
            if (email) trainer.email = email.toLowerCase();
            if (password) {
              trainer.password = await bcrypt.hash(password, 10);
            }
            if (phone) trainer.phone = phone;
            if (specialty) trainer.specialty = specialty;
            if (timings) trainer.timings = timings;

            await trainer.save();

            return res.status(200).json({ success: true, message: 'Trainer updated successfully', trainer });
          } catch (error) {
            console.error('Update trainer error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'DELETE':
          try {
            const { id } = req.query;
            const trainerId = id || req.body._id;
            if (!trainerId) {
              return res.status(400).json({ success: false, message: 'Trainer ID is required' });
            }

            const trainer = await User.findById(trainerId);
            if (!trainer) {
              return res.status(404).json({ success: false, message: 'Trainer not found' });
            }

            if (trainer.role !== 'trainer') {
              return res.status(400).json({ success: false, message: 'Selected user is not a trainer' });
            }

            await User.findByIdAndDelete(trainerId);
            return res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
          } catch (error) {
            console.error('Delete trainer error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        default:
          return res.status(405).json({ success: false, message: 'Method not allowed' });
      }
    });
  });
}
