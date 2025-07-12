# Authentication Features Documentation

## Overview
This document describes the authentication features implemented in the StackIt application, including improved error handling and password reset functionality.

## Features Implemented

### 1. Enhanced Login Error Handling
- **Specific Error Messages**: Instead of generic "Invalid credentials", users now see specific messages:
  - "User not found. Please check your email or sign up for a new account."
  - "Incorrect password. Please try again or use forgot password to reset."
  - "Your account has been banned. Please contact support for more information."

### 2. Forgot Password Functionality
- **Email-based Password Reset**: Users can request a password reset via email
- **Secure Token System**: Uses JWT tokens with 1-hour expiration
- **Beautiful Email Templates**: Professional HTML email templates for password reset
- **Two-Step Process**: 
  1. Request reset link via email
  2. Reset password using the link

### 3. Welcome Email System
- **Automatic Welcome Emails**: New users receive a welcome email upon registration
- **Professional Templates**: Beautiful HTML email templates with branding

## Setup Instructions

### 1. Environment Configuration
Add the following variables to your `.env` file:

```env
# Email Configuration (for development with Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# For production (SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# Client URL for password reset links
CLIENT_URL=http://localhost:3000
```

### 2. Gmail Setup (Development)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password in `EMAIL_PASS`

### 3. Production Email Setup
For production, consider using:
- **SendGrid**: Reliable email delivery service
- **AWS SES**: Cost-effective email service
- **Mailgun**: Developer-friendly email API

## API Endpoints

### Authentication Routes

#### POST `/api/auth/login`
- **Purpose**: User login
- **Improved Error Messages**: Specific feedback for different failure scenarios

#### POST `/api/auth/forgot-password`
- **Purpose**: Request password reset
- **Body**: `{ email: string }`
- **Response**: Success message (doesn't reveal if email exists)

#### POST `/api/auth/reset-password`
- **Purpose**: Reset password with token
- **Body**: `{ token: string, password: string }`
- **Security**: Token expires in 1 hour

## Frontend Routes

### `/forgot-password`
- **Purpose**: Forgot password form
- **Features**: 
  - Email input form
  - Success confirmation
  - Password reset form (when token is present)

### `/forgot-password?token=<reset-token>`
- **Purpose**: Password reset form
- **Features**:
  - New password input
  - Password confirmation
  - Validation and error handling

## Security Features

### 1. Rate Limiting
- Login attempts: 5 per 15 minutes
- Password reset requests: 3 per hour
- Registration: 5 per 15 minutes

### 2. Token Security
- JWT tokens with 1-hour expiration
- Secure token generation and validation
- No token storage in database (stateless)

### 3. Email Security
- Generic success messages (don't reveal email existence)
- Secure token links
- Professional email templates

## User Experience Improvements

### 1. Better Error Messages
- Clear, actionable error messages
- Specific guidance for different scenarios
- User-friendly language

### 2. Loading States
- Reusable LoadingSpinner component
- Consistent loading indicators
- Disabled buttons during operations

### 3. Toast Notifications
- Success and error notifications
- Non-intrusive feedback
- Consistent styling

## Testing the Features

### 1. Test Login Error Handling
1. Try logging in with a non-existent email
2. Try logging in with correct email but wrong password
3. Verify specific error messages appear

### 2. Test Password Reset
1. Go to `/forgot-password`
2. Enter a registered email address
3. Check email for reset link
4. Click the link and reset password
5. Try logging in with new password

### 3. Test Email Templates
1. Register a new user
2. Check for welcome email
3. Request password reset
4. Check for reset email

## Troubleshooting

### Common Issues

#### Email Not Sending
- Check email credentials in `.env`
- Verify Gmail app password is correct
- Check spam folder
- Review server logs for email errors

#### Rate Limiting Errors
- Wait for the rate limit window to expire
- Check rate limit configuration
- Verify `trust proxy` setting in server.js

#### Token Expiration
- Tokens expire after 1 hour
- Request a new reset link if needed
- Check server time synchronization

## Future Enhancements

### Potential Improvements
1. **Email Verification**: Require email verification before account activation
2. **Two-Factor Authentication**: Add 2FA support
3. **Social Login**: Integrate Google, GitHub, etc.
4. **Account Lockout**: Temporary account lockout after failed attempts
5. **Password Strength**: Enhanced password requirements and validation

## Support

For issues or questions:
1. Check server logs for error details
2. Verify environment configuration
3. Test email setup with a simple test
4. Review rate limiting settings 