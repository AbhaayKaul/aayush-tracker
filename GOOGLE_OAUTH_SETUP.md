# Google OAuth Setup Guide

Follow these steps to set up Google OAuth for your Aayush Tracker app:

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Aayush Tracker"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the consent screen:
   - User Type: **External**
   - App name: **Aayush Tracker**
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue" (skip optional fields)
   - Add test users if needed (add your own email)
4. Back to "Create OAuth client ID":
   - Application type: **Web application**
   - Name: **Aayush Tracker Web**
   - Authorized redirect URIs:
     - Add: `http://localhost:3000/auth/google/callback`
   - Click "Create"

## Step 4: Copy Credentials

After creating, you'll see a popup with:
- **Client ID** (looks like: xxxxx.apps.googleusercontent.com)
- **Client secret** (random string)

**SAVE THESE!** You'll need them in the next step.

## Step 5: Update .env File

1. Open the `.env` file in your project
2. Replace the placeholders:

```
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
SESSION_SECRET=change_this_to_any_random_string_you_want
```

Example:
```
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
SESSION_SECRET=my_super_secret_random_string_12345
```

## Step 6: Restart Server

```bash
npm start
```

## Step 7: Test!

1. Go to http://localhost:3000
2. You'll be redirected to the login page
3. Click "Sign in with Google"
4. Authorize the app
5. You should be redirected to the home page!

---

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure you added `http://localhost:3000/auth/google/callback` exactly in Google Console
- Check for trailing slashes or typos

### "Access blocked: This app's request is invalid"
- Go back to OAuth consent screen
- Add your email as a test user
- Make sure app is in "Testing" mode (not "Production")

### Can't find credentials
- Go to Google Cloud Console → APIs & Services → Credentials
- Your OAuth 2.0 Client ID will be listed there
- Click on it to see the Client ID and Secret

---

**Need help?** Let me know! 🚀

