const {google} = require("googleapis");

let oauth2client = null;

const initializeOAuth2Client = () => {
  if (!oauth2client) {
    const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
    const GOOGLE_SECRET_KEY = process.env.CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_SECRET_KEY) {
      throw new Error('Google OAuth credentials (CLIENT_ID, CLIENT_SECRET) are not configured');
    }

    oauth2client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_SECRET_KEY,
      "postmessage"
    );
  }
  return oauth2client;
};

module.exports = { 
  getOAuth2Client: initializeOAuth2Client,
  oauth2client: null // For backward compatibility, will be lazy loaded
};