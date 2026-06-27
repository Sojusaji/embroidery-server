import { compare } from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken.js"
import userModel from '../../models/User.js'
import tokenModel from '../../models/Token.js';
import AppError from '../../utils/appError.js';
import jwt from 'jsonwebtoken';

export const adminLogin = async (req, res, next) => {

  const { password, email } = req.body;

  try {

    const admin = await userModel.findOne({ email }).select('+password');
    if (!admin) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (admin.role !== 'admin' && admin.role !== 'superAdmin') {
      return next(new AppError('Access denied. Admin only.', 403));
    }


    const isPasswordMatch = await compare(password, admin.password);
    if (!isPasswordMatch) {
      return next(new AppError('Invalid credentials', 401));
    }
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'none',
      path: "/api/v1/auth/admins/refresh",
    });

    const payload = {
      userId: admin._id,
      name: admin.username,
      email: admin.email,
      role: admin.role
    };

    const newRefreshToken = generateRefreshToken(payload);

    const hashedRefreshToken = await hash(newRefreshToken, 10);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);


    await tokenModel.updateOne(
      { userId: admin._id },
      {
        $set: {
          refreshToken: hashedRefreshToken,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          expiresAt
        }
      },
      { upsert: true }
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES),
      sameSite: 'none',
      path: '/api/v1/auth/admins/refresh',
    })

    const accessToken = generateAccessToken(payload);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES),
      path: '/'
    });


    return res.status(200).json({
      status: true,
      message: 'Login successful',
      data: {
        role: admin.role,
        username: admin.username
      }
    })
  }
  catch (error) {
    next(error);
  }
}


export const adminLogout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'none',
      path: '/api/v1/auth/admins/refresh',
    });
    return res.status(200).json({
      status: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
};


export const refresh = async (req, res, next) => {

  const refreshToken = req?.cookies?.refreshToken;

  if (!refreshToken) {
    return next(new AppError('Refresh token not found, Please login again', 401));
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);

  if (!decoded) {
    return next(new AppError('Invalid token, Please login again', 401));
  }

  const tokenFromDB = await tokenModel.findOne({ userId: decoded.userId });

  if (!tokenFromDB) {
    return next(new AppError("Token may be expired or We can't find, Please login again", 401));
  }

  const isTokenMatched = await compare(refreshToken, tokenFromDB.refreshToken);

  if (!isTokenMatched) {
    return next(new AppError("Invalid token, Please login again", 401));
  }

  const payload = {
    userId: decoded.userId,
    name: decoded.name,
    email: decoded.email,
    role: decoded.role
  }

  const newAccessToken = generateAccessToken(payload);


  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES),
    path: '/',
  })

  return res.status(200).json({
    status: true,
    message: 'Login successful',
    data: {
      role: decoded.role,
      username: decoded.name
    }
  })
}