import jwt from 'jsonwebtoken';

function normalizeRole(role) {
  return typeof role === 'string' ? role.toLowerCase() : role;
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    const allowedRoles = roles.map(normalizeRole);
    const userRole = normalizeRole(req.user.role);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
}
