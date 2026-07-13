import jwt from 'jsonwebtoken';
import { authenticate, authorizeRoles } from '../../utils/auth';
import { getGymLocation, setGymAddress, setGymCoordinates } from '../../lib/gym-config';

export default async function handler(req, res) {
  authenticate(req, res, () => {
    authorizeRoles('Manager')(req, res, async () => {
      const { method } = req;

      if (method === 'GET') {
        try {
          // Generate a session token expiring in 60 seconds
          const token = jwt.sign(
            { type: 'fitcore-session', timestamp: Date.now() },
            process.env.JWT_SECRET,
            { expiresIn: '60s' }
          );

          return res.status(200).json({
            success: true,
            token,
            gymLocation: await getGymLocation()
          });
        } catch (error) {
          return res.status(500).json({ success: false, message: 'Failed to generate session' });
        }
      } else if (method === 'POST') {
        try {
          const { address, latitude, longitude } = req.body;

          let updated;
          if (address !== undefined) {
            updated = await setGymAddress(address);
          } else if (latitude !== undefined && longitude !== undefined) {
            updated = await setGymCoordinates(latitude, longitude);
          } else {
            return res.status(400).json({ success: false, message: 'Address or GPS coordinates are required' });
          }

          return res.status(200).json({
            success: true,
            message: 'Gym location updated successfully for this session',
            gymLocation: updated
          });
        } catch (error) {
          return res.status(500).json({ success: false, message: 'Failed to update gym location' });
        }
      } else {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }
    });
  });
}
