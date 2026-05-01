import { authenticate, authorizeRoles } from '../../../utils/auth';

export default async function handler(req, res) {
  // Example: Only trainers can access
  authenticate(req, res, () => {
    authorizeRoles('trainer')(req, res, () => {
      res.status(200).json({ success: true, message: 'Trainer access granted', user: req.user });
    });
  });
}
