import { OAuth2Client } from "google-auth-library";
import dotenv from 'dotenv';
dotenv.config();

export const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const generateGoogleAuthUrl = () => {
    return googleClient.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ]

    })
}


export const mailGoogleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID_FORMAIL,
    process.env.GOOGLE_CLIENT_SECRET_FORMAIL,
    process.env.GOOGLE_MAILER_REDIRECT_URI
);
