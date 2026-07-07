import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';

const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return next(new AppError('Authentication required. Please log in first', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      gmail: decoded.email,
      name: decoded.name
    };
    next();
  } catch (err) {
    return next(new AppError('Authentication failed. Please log in again.', 401));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export default authMiddleware;

