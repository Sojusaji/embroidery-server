import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';

dotenv.config({ path: '../../.env' });


export const mailGoogleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID_FORMAIL,
    process.env.GOOGLE_CLIENT_SECRET_FORMAIL,
    process.env.GOOGLE_MAILER_REDIRECT_URI
);

console.log("data:", process.env.GOOGLE_CLIENT_ID_FORMAIL,
    process.env.GOOGLE_CLIENT_SECRET_FORMAIL,
    process.env.GOOGLE_MAILER_REDIRECT_URI);
export const generateMailGoogleAuthUrl = () => {

    return mailGoogleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://mail.google.com/'],
    });
};

console.log("Auth URL:", generateMailGoogleAuthUrl());
