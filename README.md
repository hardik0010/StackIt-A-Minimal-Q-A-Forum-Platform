# Stack It - Advanced Q&A Platform

> **Built with ❤️ by Code Craft Crew**

A comprehensive, community-driven Q&A platform for developers to ask questions, share knowledge, and grow together. Features a powerful admin panel for complete platform management.

## 🚀 Features

### 👥 User Features
- **Secure Authentication**: JWT-based login/registration with role-based access
- **Question Management**: Ask, edit, and manage questions with rich text editor
- **Answer System**: Provide detailed answers with markdown support
- **Voting System**: Upvote and downvote questions and answers
- **Search & Filter**: Advanced search by title, content, or tags
- **User Profiles**: Personalized profiles with bio, avatar, and badges
- **Real-time Notifications**: Get notified of interactions and updates
- **Guest Access**: Browse content without registration
- **Responsive Design**: Works seamlessly on all devices

### 🛡️ Admin Panel Features
- **Secure Admin Authentication**: Separate admin login with role verification
- **Dashboard Analytics**: Real-time statistics and user growth charts
- **User Management**: View, search, ban/unban users, change roles
- **Content Moderation**: Review and resolve flagged questions/answers
- **Question/Answer Management**: Edit or delete any content
- **Announcement System**: Send messages to all users
- **Audit Logs**: Track all admin actions and user activities
- **Tag Management**: Add, edit, or remove tags from all questions
- **Site Settings**: Manage platform configuration
- **User Impersonation**: Support users by logging in as them

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for secure authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security headers
- **express-rate-limit** for API protection

### Frontend
- **React 18** with TypeScript
- **React Router v6** for navigation
- **Tailwind CSS** for modern styling
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for beautiful icons

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Stack_It
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Copy and configure environment variables
   cp env.example .env
   ```
   
   Edit `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/stackit
   JWT_SECRET=your_secure_jwt_secret_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   PORT=5000
   ```

4. **Create Admin User**
   ```bash
   node create-admin-user.js
   ```
   Default admin credentials:
   - Email: `admin@stackit.com`
   - Password: `admin123456`
   ⚠️ **Change password after first login!**

5. **Start the Application**
   ```bash
   # Windows
   start.bat
   
   # Unix/Linux/Mac
   npm run dev-full
   ```
   
   Or start manually:
   ```bash
   # Terminal 1 - Backend (Port 5000)
   npm run dev
   
   # Terminal 2 - Frontend (Port 3000)
   cd client && npm start
   ```

6. **Access the Platform**
   - **Main Site**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin/login

## 🎯 User Guide

### For New Users
1. **Register**: Create an account with email and username
2. **Explore**: Browse questions on the public dashboard
3. **Ask**: Post questions about programming or technology
4. **Answer**: Help others with detailed answers
5. **Vote**: Upvote good content, downvote poor content
6. **Engage**: Comment and interact with the community

### For Administrators
1. **Login**: Access admin panel at `/admin/login`
2. **Dashboard**: View platform statistics and recent activity
3. **User Management**: Manage users, ban/unban, change roles
4. **Content Moderation**: Review flagged content and take action
5. **Announcements**: Send messages to all users
6. **Settings**: Configure platform settings and manage tags

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get specific question
- `GET /api/tags` - Get all tags
- `GET /api/health` - Health check

### User Endpoints (Require Authentication)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/questions` - Create question
- `POST /api/answers` - Post answer
- `POST /api/questions/:id/vote` - Vote on question

### Admin Endpoints (Require Admin Role)
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Manage users
- `PATCH /api/admin/users/:id` - Update user (ban/role)
- `GET /api/admin/flagged` - Review flagged content
- `POST /api/admin/announcements` - Send announcements
- `GET /api/admin/audit-logs` - View audit logs
- `GET /api/admin/questions` - Manage all questions
- `GET /api/admin/settings` - Manage site settings
- `POST /api/admin/impersonate/:id` - Impersonate user

## 📁 Project Structure

```
Stack_It/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── AdminLayout.tsx # Admin panel layout
│   │   │   ├── Navbar.tsx      # Navigation
│   │   │   └── ...
│   │   ├── contexts/           # React contexts
│   │   │   ├── AuthContext.tsx # User authentication
│   │   │   └── AdminContext.tsx # Admin authentication
│   │   ├── pages/              # Page components
│   │   │   ├── Admin*.tsx      # Admin panel pages
│   │   │   ├── Dashboard.tsx   # User dashboard
│   │   │   └── ...
│   │   └── App.tsx             # Main app component
├── models/                     # MongoDB models
│   ├── User.js                 # User model
│   ├── Question.js             # Question model
│   ├── Answer.js               # Answer model
│   ├── Notification.js         # Notification model
│   ├── Announcement.js         # Announcement model
│   ├── AuditLog.js             # Audit log model
│   └── Settings.js             # Settings model
├── routes/                     # API routes
│   ├── auth.js                 # Authentication routes
│   ├── questions.js            # Question routes
│   ├── answers.js              # Answer routes
│   ├── admin.js                # Admin routes
│   └── ...
├── middleware/                 # Express middleware
│   └── auth.js                 # Authentication middleware
├── utils/                      # Utility functions
├── create-admin-user.js        # Admin user creation script
├── ADMIN_PANEL_README.md       # Admin panel documentation
└── server.js                   # Express server
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin-only routes and features
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation on all inputs
- **Rate Limiting**: API protection against abuse
- **Security Headers**: Helmet for enhanced security
- **Audit Logging**: Track all admin actions for accountability

## 🎨 Admin Panel Features

### Dashboard
- Real-time platform statistics
- User growth charts (last 30 days)
- Recent user and question activity
- Flagged content counters

### User Management
- Search and filter users
- Ban/unban functionality
- Role management (admin/user/guest)
- User activity tracking

### Content Moderation
- Review flagged questions and answers
- Take moderation actions (remove flags, warn, delete)
- Track flag history and reasons

### System Management
- Send announcements to all users
- View comprehensive audit logs
- Manage site settings
- Tag management and cleanup
- User impersonation for support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `ADMIN_PANEL_README.md` for admin panel details
- **Issues**: Open an issue in the repository
- **Questions**: Use the platform to ask questions about the codebase

## 🙏 Acknowledgments

**Built with ❤️ by Code Craft Crew**

A team dedicated to creating innovative, user-friendly, and powerful web applications that make a difference in the developer community.

---

**Stack It** - Where developers help developers grow together. 🚀 