import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GMAIL || !process.env.PASSWORD) {
    console.error("❌ Crucial environment variables missing inside your .env configuration file.");
}


export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL,
        pass: process.env.PASSWORD, 
    }
});


transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Transporter connection failed:", error.message);
    } else {
        console.log("🚀 Nodemailer is ready to securely transmit OTP messages.");
    }
});