import { compare } from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js"
import { loginSchema } from "../utils/authValidator.js";
import userModel from '../models/User.js'
import tokenModel from '../models/Token.js';
import AppError from '../utils/appError.js';

export const loginAdmin = async (req, res, next) => {
  const { password, email } = req.body;
  try {
    await loginSchema.validateAsync(req.body);

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
    res.clearCookie('AccessToken');
    res.clearCookie('RefreshToken');

    const payload = {
      userId: admin._id,
      name: admin.username,
      email: admin.email,
      role: admin.role
    };

    const newRefreshToken = generateRefreshToken(payload);

    await tokenModel.updateOne(
      { userId: admin._id },
      { $set: { refreshToken: newRefreshToken } },
      { upsert: true }
    );

    res.cookie('RefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,// 7 days
      sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
      path: '/user/refresh',
    })

    const accessToken = generateAccessToken(payload);
    res.cookie('AccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
      maxAge: 30 * 60 * 1000, // 30minit
      path: '/'
    });

    res.status(200).json({
      status: 'success',
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

export const getAdmins = async (req, res, next) => {
  try {
    const admins = await userModel.find({ role: { $in: ['admin', 'superAdmin'] } }).select('-password');
    res.status(200).json({
      status: 'success',
      data: admins
    });
  } catch (error) {
    next(error);
  }
};

export const addAdmin = async (req, res, next) => {
  const { username, gmail, password, role } = req.body;
  try {
    const existingAdmin = await userModel.findOne({ gmail });
    if (existingAdmin) {
      return next(new AppError('Admin with this email already exists', 400));
    }

    const hashedPassword = await hash(password, 12);
    const newAdmin = await userModel.create({
      username,
      gmail,
      password: hashedPassword,
      role: role || 'admin'
    });

    newAdmin.password = undefined;

    res.status(201).json({
      status: 'success',
      data: newAdmin
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await userModel.findById(req.params.id);
    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    if (admin.role === 'superAdmin') {
      return next(new AppError('Cannot delete super admin', 403));
    }

    await userModel.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
export const verifyToken = async (req, res, next) => {
  console.log('req.admin:',req.admin);
  try {
    const admin = await userModel.findById(req.admin.id).select('-password');
    if (!admin) {
      return next(new AppError('Admin no longer exists', 404));
    }
    res.status(200).json({
      status: 'success',
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAdmin = async (req, res, next) => {
  try {
    res.clearCookie('AccessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
      path: '/'
    });
    res.clearCookie('RefreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
      path: '/user/refresh',
    });
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary=()=>{
  try {
    
  } catch (error) {
    
  }
}