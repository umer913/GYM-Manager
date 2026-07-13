import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import CheckIn from '../../models/CheckIn';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../utils/auth';
import { getGymLocation, reverseGeocodeCoords } from '../../lib/gym-config';

// Haversine formula to calculate distance in meters
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, async () => {
    const { method } = req;
    const userId = req.user.userId;

    if (method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
      const { token, latitude, longitude } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, message: 'Scan token is required' });
      }

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ success: false, message: 'GPS coordinates are required' });
      }

      // 1. Verify Scan Token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'fitcore-session') {
          return res.status(400).json({ success: false, message: 'Invalid scan token' });
        }
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(400).json({ success: false, message: 'Attendance QR code has expired. Please scan a fresh QR code.' });
        }
        return res.status(400).json({ success: false, message: 'Invalid or corrupted scan token.' });
      }

      // 2. Fetch User Profile
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.membershipStatus !== 'active') {
        return res.status(400).json({ success: false, message: 'Your membership is inactive. Cannot mark attendance.' });
      }

      // 3. Proximity Geolocation Verification (GPS check within 100 meters)
      const gymLocation = await getGymLocation();
      const distance = getDistanceInMeters(latitude, longitude, gymLocation.latitude, gymLocation.longitude);

      if (distance > 100) {
        // Reverse geocode locations to show city, area, street instead of coordinates
        const memberAddress = await reverseGeocodeCoords(latitude, longitude);
        const gymAddress = gymLocation.address || await reverseGeocodeCoords(gymLocation.latitude, gymLocation.longitude);

        return res.status(400).json({
          success: false,
          message: `Location check failed. You must be inside the gym.`,
          errorDetails: `You are currently at: "${memberAddress}" which is ${Math.round(distance)} meters away from the gym ("${gymAddress}").`
        });
      }

      // 4. Double Check Checkin Today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const existingCheckIn = await CheckIn.findOne({
        user: userId,
        role: 'member',
        checkInTime: { $gte: startOfToday, $lte: endOfToday }
      });

      if (existingCheckIn) {
        return res.status(400).json({ success: false, message: 'You have already checked in today.' });
      }

      // 5. Create Checkin
      const checkIn = await CheckIn.create({
        user: userId,
        name: user.name,
        role: 'member',
        checkInTime: new Date()
      });

      return res.status(201).json({
        success: true,
        message: 'Attendance marked successfully!',
        checkIn,
        distance: Math.round(distance)
      });

    } catch (error) {
      console.error('Member checkin API error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
}
