import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';

export const authMiddleware = (req, res, next) => {

  let token = req.cookies.accessToken || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (token) {
    token = token.trim()
  }

  if (!token || token === 'undefined' || token === 'null') {
    return next(new AppError('Authentication required. Please log in first', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
   console.log('decode:',decoded);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      gmail: decoded.email,
      name: decoded.name
    };
    console.log('user details decoded from jwt token:', req.user);
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



