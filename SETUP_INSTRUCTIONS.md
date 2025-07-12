# StackIt Setup Instructions

## Issues Fixed

I've identified and fixed the following issues in your StackIt project:

1. **Port Mismatch**: Client was trying to connect to port 5001, but server runs on port 5000
2. **Email Service**: Updated to work without SendGrid configuration (logs emails to console for development)
3. **Password Comparison**: Fixed password comparison method in User model
4. **Environment Variables**: Created setup guide for proper configuration

## Quick Setup

### 1. Create Environment File

Create a `.env` file in your project root with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/stackit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Client URL for password reset links
CLIENT_URL=http://localhost:3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Start MongoDB

Make sure MongoDB is running on your system. If you don't have it installed:

**Windows:**
- Download and install MongoDB Community Server
- Start MongoDB service

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4. Start the Application

**Option 1: Start both server and client separately**
```bash
# Terminal 1 - Start server
npm run dev

# Terminal 2 - Start client
cd client
npm start
```

**Option 2: Start both together**
```bash
npm run dev-full
```

### 5. Test the Application

1. Open your browser to `http://localhost:3000`
2. Try registering a new user
3. Check the server console for email logs (emails will be logged instead of sent in development)

## Email Configuration (Optional)

### For Development (Gmail)

If you want emails to actually be sent, add these to your `.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**To get Gmail App Password:**
1. Enable 2-factor authentication on your Google account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password for "Mail"

### For Production (SendGrid)

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=your_verified_sender_email@example.com
```

## Testing

Run the test script to verify everything is working:

```bash
node test-registration.js
```

## What's Working Now

✅ **User Registration**: Users can register with username, email, password, and optional name fields
✅ **User Login**: Users can log in with email and password
✅ **Email Service**: Welcome emails are sent (logged to console in development)
✅ **Password Reset**: Forgot password functionality works
✅ **JWT Authentication**: Secure token-based authentication
✅ **Form Validation**: Client and server-side validation
✅ **Error Handling**: Proper error messages and handling

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check if the connection string is correct

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill any existing processes on the port

3. **CORS Errors**
   - Make sure the client is running on `http://localhost:3000`
   - Check the CORS configuration in `server.js`

4. **Email Not Sending**
   - In development, emails are logged to console
   - Check server console for email logs
   - Configure SMTP or SendGrid for actual email sending

### Debug Mode

To see more detailed logs, set in your `.env`:
```env
NODE_ENV=development
```

## File Structure

```
Stack_It/
├── server.js              # Main server file
├── routes/
│   └── auth.js           # Authentication routes
├── models/
│   └── User.js           # User model with password hashing
├── utils/
│   └── emailService.js   # Email service (updated)
├── middleware/
│   └── auth.js           # Authentication middleware
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── Signup.tsx
│   │   └── contexts/
│   │       └── AuthContext.tsx
└── .env                  # Environment variables (create this)
```

## Next Steps

1. Test user registration and login
2. Configure email service if needed
3. Add more features like questions, answers, etc.
4. Deploy to production with proper environment variables

The application should now work properly for user registration and email functionality! 