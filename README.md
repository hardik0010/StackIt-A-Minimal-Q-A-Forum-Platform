# StackIt - Q&A Forum Platform

A modern Q&A forum platform built with Node.js, Express, React, and MongoDB. Features include user authentication, question/answer management, and a beautiful responsive UI.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Stack_It
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/stackit
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # Email (for password reset)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CLIENT_URL=http://localhost:3000
   ```

### Running the Application

#### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev-full
```

#### Option 2: Run Servers Separately
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

#### Option 3: Windows Batch Script
```bash
start.bat
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## ✨ New Features

### 🔐 Enhanced Authentication
- **Specific Login Error Messages**: Clear feedback for different login failures
- **Forgot Password System**: Email-based password reset with secure tokens
- **Welcome Emails**: Automatic welcome emails for new users
- **Professional Email Templates**: Beautiful HTML emails

### 🎨 User Experience Improvements
- **Loading States**: Consistent loading indicators
- **Toast Notifications**: Success/error feedback
- **Responsive Design**: Works on all devices
- **Modern UI**: Gradient backgrounds and smooth animations

## 🧪 Testing the Features

### 1. Test Enhanced Login Error Handling
1. Go to http://localhost:3000/login
2. Try logging in with a non-existent email
3. Try logging in with correct email but wrong password
4. Verify you see specific, helpful error messages

### 2. Test Forgot Password System
1. Go to http://localhost:3000/forgot-password
2. Enter a registered email address
3. Check your email for the reset link
4. Click the link and reset your password
5. Try logging in with the new password

### 3. Test Registration & Welcome Email
1. Go to http://localhost:3000/signup
2. Create a new account
3. Check your email for the welcome message

## 📧 Email Setup

### For Development (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Add to `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### For Production
Use services like SendGrid, AWS SES, or Mailgun:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

## 🏗️ Project Structure

```
Stack_It/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main app component
│   └── package.json
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── questions.js       # Question routes
│   └── ...
├── models/                # MongoDB models
├── middleware/            # Express middleware
├── utils/                 # Utility functions
│   └── emailService.js    # Email functionality
├── server.js              # Express server
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Questions & Answers
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get specific question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse of API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Express-validator for data validation
- **CORS Protection**: Configured for security
- **Helmet**: Security headers

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables
2. Configure MongoDB connection
3. Set up email service
4. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment
1. Build the React app: `cd client && npm run build`
2. Deploy the `build` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the server logs for error details
2. Verify environment configuration
3. Test email setup
4. Review the documentation

---

**Happy Coding! 🎉** 

## Security Notice

**Never commit your `.env` file or any secret API keys to GitHub or any public repository.**

- Use the provided `.env.example` as a template for your environment variables.
- Add your actual secrets to a local `.env` file, which is already gitignored.
- If you accidentally commit secrets, rotate them immediately and remove them from your commit history. 