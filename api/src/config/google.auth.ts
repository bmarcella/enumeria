import { DambaGoogleAuth } from "@Damba/v2/auth/DambaGoogleAuth";
import { OAuth2Client } from "google-auth-library";
import dotenv from 'dotenv';
 dotenv.config();
const googleAuth = DambaGoogleAuth.init<OAuth2Client>(OAuth2Client, {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
});

export const oauth2Google = googleAuth.getAuth;
