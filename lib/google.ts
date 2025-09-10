// lib/google.ts
import { google } from "googleapis";

export function getGoogleClient() {
    const {
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REFRESH_TOKEN,
    } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
        throw new Error("Google API env vars missing.");
    }

    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        "http://localhost" // não usado para refresh
    );

    oauth2Client.setCredentials({
        refresh_token: GOOGLE_REFRESH_TOKEN,
    });

    return google.calendar({ version: "v3", auth: oauth2Client });
}
