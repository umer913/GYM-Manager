import dbConnect from '../../../lib/mongodb';
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
            const trainers = await Trainer.find({})
              .sort({ createdAt: -1 });
            return res.status(200).json({ success: true, trainers });
          } catch (error) {
            console.error('Fetch trainers error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'POST':
          try {
            const { name, phone, specialty, timings } = req.body;
            if (!name || !phone) {
              return res.status(400).json({ success: false, message: 'Name and phone are required' });
            }

            const trainer = await Trainer.create({
              name,
              phone,
              specialty: specialty || 'General',
              timings: timings || 'Morning (06:00 AM - 11:00 AM)'
            });

            return res.status(201).json({ success: true, message: 'Trainer added successfully', trainer });
          } catch (error) {
            console.error('Add trainer error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'PUT':
          try {
            const { id } = req.query;
            const { name, phone, specialty, timings } = req.body;

            const trainerId = id || req.body._id;
            if (!trainerId) {
              return res.status(400).json({ success: false, message: 'Trainer ID is required' });
            }

            const trainer = await Trainer.findById(trainerId);
            if (!trainer) {
              return res.status(404).json({ success: false, message: 'Trainer not found' });
            }

            if (name) trainer.name = name;
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

            const trainer = await Trainer.findById(trainerId);
            if (!trainer) {
              return res.status(404).json({ success: false, message: 'Trainer not found' });
            }

            await Trainer.findByIdAndDelete(trainerId);
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
