import userModel from '../../models/User.js'
import AppError from '../../utils/appError.js';
import { hash } from "bcryptjs";

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



export const getDashboardSummary = () => {
    try {

    } catch (error) {

    }
}