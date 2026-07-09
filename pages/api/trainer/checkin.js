import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import CheckIn from '../../../models/CheckIn';
import jwt from 'jsonwebtoken';
import { authenticate, authorizeRoles } from '../../../utils/auth';
import { getGymLocation, reverseGeocodeCoords } from '../../../lib/gym-config';

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('trainer')(req, res, async () => {
      try {
        const trainerId = req.user.userId;
        const { token, latitude, longitude } = req.body;

        if (!token) return res.status(400).json({ success: false, message: 'Scan token is required' });
        if (latitude === undefined || longitude === undefined)
          return res.status(400).json({ success: false, message: 'GPS coordinates are required' });

        // 1. Verify QR token
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded.type !== 'fitcore-session')
            return res.status(400).json({ success: false, message: 'Invalid scan token' });
        } catch (err) {
          if (err.name === 'TokenExpiredError')
            return res.status(400).json({ success: false, message: 'QR code has expired. Ask the manager for a fresh code.' });
          return res.status(400).json({ success: false, message: 'Invalid or corrupted scan token.' });
        }

        // 2. Load trainer
        const trainer = await User.findById(trainerId);
        if (!trainer || trainer.role !== 'trainer')
          return res.status(403).json({ success: false, message: 'Trainer not found' });

        // 3. GPS proximity check
        const gymLocation = getGymLocation();
        const distance = getDistanceInMeters(latitude, longitude, gymLocation.latitude, gymLocation.longitude);

        if (distance > 100) {
          const trainerAddress = await reverseGeocodeCoords(latitude, longitude);
          const gymAddress = gymLocation.address || await reverseGeocodeCoords(gymLocation.latitude, gymLocation.longitude);
          return res.status(400).json({
            success: false,
            message: 'Location check failed. You must be inside the gym.',
            errorDetails: `You are at: "${trainerAddress}" — ${Math.round(distance)} m away from the gym ("${gymAddress}").`,
          });
        }

        // 4. Duplicate check
        const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
        const endOfToday   = new Date(); endOfToday.setHours(23, 59, 59, 999);

        const existing = await CheckIn.findOne({
          trainer: trainerId,
          role: 'trainer',
          checkInTime: { $gte: startOfToday, $lte: endOfToday },
        });
        if (existing)
          return res.status(400).json({ success: false, message: 'You have already checked in today.' });

        // 5. Create record
        const checkIn = await CheckIn.create({
          trainer: trainerId,
          name: trainer.name,
          role: 'trainer',
          checkInTime: new Date(),
        });

        return res.status(201).json({
          success: true,
          message: 'Attendance marked successfully!',
          checkIn,
          distance: Math.round(distance),
        });
      } catch (error) {
        console.error('Trainer checkin error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
      }
    });
  });
}
