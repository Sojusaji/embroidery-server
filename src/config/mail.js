import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GMAIL
    || !process.env.GOOGLE_CLIENT_ID_FORMAIL
    || !process.env.GOOGLE_CLIENT_SECRET_FORMAIL
    || !process.env.REFRESH_TOKEN_FORMAIL) {
    console.error("❌ Crucial environment variables missing inside your .env configuration file.");
}



export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: "OAuth2",
        user: process.env.GMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID_FORMAIL,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_FORMAIL,
        refreshToken: process.env.REFRESH_TOKEN_FORMAIL,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100
});


transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Transporter connection failed:", error.message);
    } else {
        console.log("🚀 Nodemailer is ready to securely transmit OTP messages.");
    }
});