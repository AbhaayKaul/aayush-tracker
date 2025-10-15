# Email Setup Guide (Gmail)

To send emails after form submission, you need to configure Gmail with an **App Password**.

## Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on "2-Step Verification"
3. Follow the steps to enable it (if not already enabled)
4. You'll need your phone for verification

## Step 2: Create App Password

1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Click on "2-Step Verification" again
3. Scroll down to find "App passwords" (at the bottom)
4. Click on "App passwords"
5. You might need to sign in again
6. Select:
   - App: **Mail**
   - Device: **Other (Custom name)**
   - Type: "Aayush Tracker"
7. Click "Generate"
8. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

## Step 3: Update .env File

Open your `.env` file and add:

```
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_character_app_password
```

**Example:**
```
EMAIL_USER=abhaykaul224@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

⚠️ **Important:** Use the App Password, NOT your regular Gmail password!

## Step 4: Restart Server

```bash
npm start
```

## Step 5: Test!

1. Submit a form response
2. Check your email inbox
3. You should receive a confirmation email! 📧

---

## What the Email Contains:

✅ Personalized greeting with your name  
✅ Submission details (date, reason, status)  
✅ Conditional details (time taken or reason for not coming)  
✅ Link to dashboard  
✅ Professional formatting with emojis  

---

## Email Examples:

### If "Yes" (Aayush came):
- Subject: `✅ Response Submitted - Aayush came`
- Contains: Time taken to come down

### If "No" (Aayush didn't come):
- Subject: `✅ Response Submitted - Aayush didn't come`
- Contains: Reason for not coming

### If "Hehehe bhai":
- Subject: `✅ Response Submitted - Hehehe bhai - You got Aayushed!`
- Special message with party emoji! 🎉

---

## Troubleshooting

### "Invalid login" error
- Make sure you're using an App Password, not your regular password
- Remove any spaces from the App Password

### "Less secure app access" message
- Use App Password (as described above)
- Regular passwords don't work anymore

### Not receiving emails
- Check spam/junk folder
- Verify EMAIL_USER is correct
- Make sure 2-Step Verification is enabled

---

**Need help?** Let me know! 📧

