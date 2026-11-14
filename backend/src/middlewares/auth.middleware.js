import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'SECRET_KEY_SCHOOL_MS_2026';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Also check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token provided',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Not authorized, invalid or expired token',
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role (${req.user?.role || 'unknown'}) is not authorized.`,
      });
    }
    next();
  };
};

export default protect;
