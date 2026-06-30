import jwt from "jsonwebtoken";
import { compare, hash } from "bcryptjs";
import AppError from "../../utils/appError.js";
import User from "../../models/User.js";
import otpModel from "../../models/Otp.js";
import tokenModel from "../../models/Token.js";
import { generateOtp, sendVerificationEmail } from "../../scripts/emailService.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken.js";


const createAndSendOtp = async (email) => {
    const otp = generateOtp();
    const dynamicExpiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await otpModel.deleteMany({ email });
    await otpModel.create({
        email,
        otp: otp,
        expiresAt: dynamicExpiryTime
    });

    await sendVerificationEmail(email, otp);
};

export const verifyUser = async (req, res, next) => {
    try {
        const { email } = req.body;


        const user = await User.findOne({ email });
        if (!user) {
            res.status(200).json({
                success: true,
                exists: false,
                user: null,
                message: "Account does not exist, please register."
            })
        }

        return res.status(200).json({
            success: true,
            exists: true,
            user: { id: user.id, userName: user.username, email: user.email, role: user.role },
            message: "Account verified successfully."
        });
    } catch (error) {
        next(error);
    }
};


export const sendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        await createAndSendOtp(email);

        return res.status(200).json({
            success: true,
            message: 'Verification OTP sent successfully.',
        });
    } catch (error) {
        next(error);
    }
};

export const userLogin = async (req, res, next) => {
    try {
        const { email, otp } = req.body;


        const otpFromDB = await otpModel.findOne({ email });
        if (!otpFromDB) {
            return next(new AppError("Verification record not found. Please request a new OTP.", 403));
        }


        if (otp !== otpFromDB.otp) {
            return next(new AppError("Your OTP is incorrect or has expired.", 400));
        }

        let existingUser = await User.findOne({ email });
        if (!existingUser) {
            return next(new AppError("Account data not found. Please register first.", 404));
        }

        if (!existingUser.isVerified) {
            const verifiedUser = await User.findOneAndUpdate(
                { email },
                { $set: { isVerified: true } },
                { new: true }
            );

            if (!verifiedUser) {
                return next(new AppError("Could not verify your account. Please try again.", 400));
            }
            existingUser = verifiedUser;
        }

        const tokenPayload = {
            userId: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: "user"
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        const hashedRefreshToken = await hash(refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // 7 days

        await tokenModel.deleteMany({
            userId: existingUser._id,
            userAgent: req.get('user-agent')
        });

        await tokenModel.create({
            userId: existingUser._id,
            refreshToken: hashedRefreshToken,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            expiresAt
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            path: "/api/v1/auth/users/refresh",
            maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES),
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES),
            path: '/',
        });

        return res.status(200).json({
            success: true,
            user: existingUser,
            message: "Logged in successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const register = async (req, res, next) => {
    try {

        const { name, email } = req.body;


        const emailAlreadyExists = await User.findOne({ email });
        if (emailAlreadyExists) {
            return next(new AppError("Email already in use. Please login or use another email.", 409));
        }

        await User.create({
            name,
            email,
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful. Verification required."
        });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req?.cookies?.refreshToken;
        if (!refreshToken) {
            return next(new AppError('No refresh token provided', 401));
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        if (!decoded) {
            return next(new AppError('Invalid refresh token', 401));
        }


        const activeTokens = await tokenModel.find({ userId: decoded.userId });
        if (!activeTokens || activeTokens.length === 0) {
            return next(new AppError('Session expired. Please log in again.', 401));
        }

        let isTokenMatched = false;
        for (const tokenDoc of activeTokens) {
            const match = await compare(refreshToken, tokenDoc.refreshToken);
            if (match) {
                isTokenMatched = true;
                break;
            }
        }

        if (!isTokenMatched) {
            return next(new AppError('Invalid refresh token. Please login again.', 403));
        }

        const payload = {
            userId: decoded.userId,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
        };

        const accessToken = generateAccessToken(payload);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES),
            path: '/',
        });

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const userLogout = async (req, res, next) => {
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
            path: "/api/v1/auth/users/refresh",
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};