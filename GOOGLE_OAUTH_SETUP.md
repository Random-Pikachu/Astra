# Google OAuth Setup Guide

## Prerequisites

Before you can use Google OAuth, you need to set up a Google Cloud project and configure OAuth credentials.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google People API)

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Configure the consent screen if prompted
4. Choose **Web application** as the application type
5. Add these URIs:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:3000/auth/google/callback`

## Step 3: Configure Environment Variables

Create a `.env` file in your `Backend/` directory with the following:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Email Configuration (for OTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

## Step 4: Install Backend Dependencies

Make sure your backend has the required dependencies:

```bash
cd Backend
npm install passport passport-google-oauth20 passport-local express-session
```

## Step 5: Test the Integration

1. Start your backend server:
   ```bash
   cd Backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd Frontend
   npm run dev
   ```

3. Visit `http://localhost:5173` and try logging in with Google

## How It Works

1. User clicks "Continue with Google" button
2. Frontend redirects to `http://localhost:3000/auth/google`
3. Backend redirects to Google OAuth consent screen
4. After user consents, Google redirects to `http://localhost:3000/auth/google/callback`
5. Backend processes the OAuth response and redirects to `http://localhost:5173/welcome?user=...`
6. Frontend Welcome page extracts user data from URL and stores it in localStorage
7. User sees the welcome screen with their information

## Features

- ✅ Google OAuth integration
- ✅ Automatic user creation for new Google users
- ✅ Modern, responsive Welcome page
- ✅ Consistent UI design with existing pages
- ✅ Proper error handling
- ✅ Session management with localStorage
- ✅ Logout functionality

## Security Notes

- User data is temporarily passed via URL parameters (encrypted)
- Data is stored in localStorage for persistence
- Backend validates all OAuth responses
- Proper error handling for failed authentications