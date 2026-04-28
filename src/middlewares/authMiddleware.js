import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';

const authMiddleware = (req, res, next) => {
  const token = req.cookies.AccessToken || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  
  if (!token) {
    return next(new AppError('No token, authorization denied', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    req.admin = {
      id: decoded.userId,
      role: decoded.role,
      gmail: decoded.email
    };
    next();
  } catch (err) {
    return next(new AppError('Token is not valid', 401));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export default authMiddleware;

