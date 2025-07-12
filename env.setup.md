# Environment Setup Guide

Copy the following content to a `.env` file in your project root:

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

# Email Configuration
# For development, we'll use a simple SMTP setup
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMTP Configuration (for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SendGrid Configuration (for production)
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=your_verified_sender_email@example.com

# Client URL for password reset links
CLIENT_URL=http://localhost:3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Important Notes:

1. **JWT_SECRET**: Change this to a long, random string for production
2. **MONGODB_URI**: Make sure MongoDB is running locally or use a cloud MongoDB instance
3. **Email Configuration**: 
   - For development: Use Gmail with an App Password
   - For production: Use SendGrid or another email service
4. **If no email configuration is provided**: Emails will be logged to console instead of sent

## Quick Setup for Development:

1. Create a `.env` file with the content above
2. Change the JWT_SECRET to something random
3. If you want emails to work, configure SMTP or SendGrid
4. If not, emails will be logged to console (which is fine for development)

## Testing the Setup:

1. Start the server: `npm run dev`
2. Start the client: `cd client && npm start`
3. Try registering a new user
4. Check the server console for email logs 