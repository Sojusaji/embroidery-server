import jwt from 'jsonwebtoken';

export const generateAccessToken = ({ userId, name, email, role }) => {
    const id = userId ? userId.toString() : null;

    return jwt.sign(
        {
            userId: id,
            name,
            email,
            role
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES,
        }
    )
}

export const generateRefreshToken = ({ userId, name, email, role }) => {
    const id = userId ? userId.toString() : null;
    return jwt.sign(
        {
            userId: id,
            name,
            email,
            role
        },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES
        }
    )
}

