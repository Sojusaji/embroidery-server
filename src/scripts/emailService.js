import { transporter } from '../config/mail.js';

export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


const createEmailLayout = (innerHtmlContent) => {
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #18181b; margin: 0; font-size: 24px; font-weight: 700;">Loom & Luster Studio</h2>
        </div>
        <hr style="border: 0; border-top: 1px solid #e4e4e7; margin-bottom: 24px;" />
        
        ${innerHtmlContent}

        <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} Loom & Luster Studio. All rights reserved.<br />
            This is an automated operational transmission. Please do not reply directly to this message.
        </p>
    </div>`;
};

export const sendVerificationEmail = async ({ targetEmail, otpCode }) => {
    try {
        const innerContent = `
            <p style="color: #3f3f46; font-size: 16px; line-height: 24px;">Hello,</p>
            <p style="color: #3f3f46; font-size: 16px; line-height: 24px;">We received a request to verify your identity for your Loom & Luster Studio account. Use the secure one-time verification code below to proceed:</p>
            
            <div style="text-align: center; margin: 32px 0;">
                <span style="display: inline-block; background-color: #f4f4f5; color: #020617; font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 6px; padding: 14px 32px; border-radius: 8px; border: 1px solid #e4e4e7;">
                    ${otpCode}
                </span>
            </div>
            
            <p style="color: #71717a; font-size: 14px; line-height: 20px;">This authentication token is highly time-sensitive and remains valid for exactly <b>10 minutes</b>. If you did not request this code, please safely ignore this email.</p>
        `;

        const mailOptions = {
            from: `"Loom & Luster Studio Support" <${process.env.GMAIL}>`,
            to: targetEmail,
            subject: "🔐 Secure Account Verification OTP",
            html: createEmailLayout(innerContent),
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error("Nodemailer Transporter Error:", error);
        throw error;
    }
};

export const sendPaymentSuccessfullEmail = async ({ targetEmail, customerName, orderId, razorpayPaymentId, totalAmount }) => {
    try {
        const innerContent = `
            <p style="color: #3f3f46; font-size: 16px; line-height: 24px;">Hello <b>${customerName}</b>,</p>
            <p style="color: #3f3f46; font-size: 16px; line-height: 24px;">Thank you for your purchase! We have successfully received your payment, and your order is now being processed.</p>

            <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; border: 1px solid #e4e4e7; margin: 24px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #71717a;"><b>Order ID:</b> ${orderId}</p>
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #71717a;"><b>Payment ID:</b> ${razorpayPaymentId}</p>
                <p style="margin: 0; font-size: 14px; color: #71717a;"><b>Total Paid:</b> ₹${totalAmount}</p>
            </div>

            <p style="color: #3f3f46; font-size: 16px; line-height: 24px;">We will notify you again with tracking details once your items are shipped out from our studio.</p>
        `;

        const mailOptions = {
            from: `"Loom & Luster Studio Support" <${process.env.GMAIL}>`,
            to: targetEmail,
            subject: "🎉 Payment Confirmed! Your Loom & Luster Order is Placed",
            html: createEmailLayout(innerContent),
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error("Nodemailer Transporter Error:", error);
        throw error;
    }
};