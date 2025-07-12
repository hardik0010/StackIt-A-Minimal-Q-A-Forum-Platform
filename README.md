# StackIt - Q&A Platform

A community-driven Q&A platform for developers to ask questions, share knowledge, and grow together.

## Features

- **User Authentication**: Secure registration and login system
- **Question Management**: Ask, edit, and manage questions
- **Answer System**: Provide answers to questions
- **Voting System**: Upvote and downvote questions and answers
- **Search & Filter**: Find questions by title, content, or tags
- **User Profiles**: Personalize your profile with bio and avatar
- **Real-time Notifications**: Get notified of new answers and interactions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StackIt
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

3. **Environment Setup**
   ```bash
   # Copy environment variables
   cp env.example .env
   
   # Edit .env file with your configuration
   MONGODB_URI=mongodb://localhost:27017/stackit
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=7d
   ```

4. **Start the application**
   ```bash
   # On Windows
   start.bat
   
   # On Unix/Linux/Mac
   npm run dev-full
   ```

   Or start manually:
   ```bash
   # Terminal 1 - Backend (Port 5000)
   npm run dev
   
   # Terminal 2 - Frontend (Port 3000)
   cd client && npm start
   ```

## User Guide

### For New Users
1. **Register**: Create an account with your email and username
2. **Explore**: Browse questions and answers on the public dashboard
3. **Ask**: Post your first question about programming or technology
4. **Answer**: Help others by providing helpful answers
5. **Vote**: Upvote good questions/answers, downvote poor ones
6. **Engage**: Comment on answers and interact with the community

### For Developers
- **Guest Access**: Anyone can browse and search content without registration
- **Full Access**: Registered users can ask questions, answer, vote, and comment
- **No Reputation Barriers**: All authenticated users can participate fully
- **Community Driven**: Quality content rises through voting

### Navigation
- **Home** (`/`): Public dashboard with all questions
- **Dashboard** (`/dashboard`): User-specific dashboard (requires login)
- **Ask Question** (`/ask`): Post new questions (requires login)
- **Login** (`/login`): User authentication
- **Sign Up** (`/signup`): Create new account

## API Endpoints

### Public Endpoints
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get specific question
- `GET /api/tags` - Get all tags

### Protected Endpoints (Require Authentication)
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `POST /api/answers` - Post answer
- `POST /api/questions/:id/vote` - Vote on question
- `GET /api/auth/me` - Get current user info

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security headers

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Project Structure

```
StackIt/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main app component
├── models/                 # MongoDB models
├── routes/                 # API routes
├── middleware/             # Express middleware
├── utils/                  # Utility functions
└── server.js              # Express server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 