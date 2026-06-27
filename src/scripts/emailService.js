import { transporter } from '../config/mail.js';


export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


export const sendVerificationEmail = async (targetEmail, otpCode) => {
    const mailOptions = {
        from: `"Stitch&Art" <${process.env.GMAIL}>`,
        to: targetEmail,
        subject: "Secure Account Verification OTP",
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #333;">Verify Your Account</h2>
       
             <p>Your one-time security verification code is:</p>
                <h1 style="color: #007bff; letter-spacing: 4px; font-size: 32px;">${otpCode}</h1>
                <p style="color: #555;">This authentication verification token remains valid for exactly <b>5 minutes</b>.</p>
            </div>
        `
    };

    const deliveryResult = await transporter.sendMail(mailOptions);
    return deliveryResult;
};