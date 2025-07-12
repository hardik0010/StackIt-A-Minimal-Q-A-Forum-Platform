# Stack It Admin Panel

A comprehensive admin panel for managing the Stack It Q&A platform. This admin panel provides powerful tools for user management, content moderation, and system monitoring.

## Features

### 🔐 Secure Admin Authentication
- Separate admin login system
- Role-based access control (admin only)
- Secure token-based authentication
- Automatic session management

### 📊 Dashboard Analytics
- Real-time statistics overview
- User growth charts (last 30 days)
- Content statistics (questions, answers)
- Recent user and question activity
- Flagged content counters

### 👥 User Management
- View all users with pagination
- Search users by username or email
- Filter by role (admin, user, guest)
- Filter by status (active, banned)
- Ban/unban users
- Change user roles
- View user activity and join dates

### 🚩 Content Moderation
- Review flagged questions and answers
- View flag details and reasons
- Take moderation actions:
  - Remove flags (approve content)
  - Warn content authors
  - Delete inappropriate content
- Track flag history and moderators

### 📈 System Statistics
- Total users, questions, and answers
- User growth trends
- Banned user count
- Flagged content statistics
- Monthly and weekly activity metrics

## Setup Instructions

### 1. Create Admin User

First, create an admin user in your database:

```bash
node create-admin-user.js
```

This will create an admin user with the following credentials:
- **Username**: admin
- **Email**: admin@stackit.com
- **Password**: admin123456

⚠️ **Important**: Change the password after first login!

### 2. Access Admin Panel

Navigate to the admin login page:
```
http://localhost:3000/admin/login
```

### 3. Admin Panel Routes

- **Login**: `/admin/login`
- **Dashboard**: `/admin/dashboard`
- **User Management**: `/admin/users`
- **Flagged Content**: `/admin/flagged`

## API Endpoints

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/stats` - Get detailed system statistics

### User Management
- `GET /api/admin/users` - Get users with pagination and filters
- `PATCH /api/admin/users/:userId` - Update user (ban/unban, change role)

### Content Moderation
- `GET /api/admin/flagged` - Get flagged content
- `POST /api/admin/flags/:contentType/:contentId/resolve` - Resolve flags

## Security Features

### Authentication
- JWT-based authentication
- Admin-only route protection
- Automatic token validation
- Secure logout functionality

### Authorization
- Role-based access control
- Admin middleware protection
- Self-ban prevention (admins can't ban themselves)

### Data Protection
- Password hashing with bcrypt
- Secure session management
- Input validation and sanitization
- Rate limiting on API endpoints

## User Management Features

### User Actions
- **Ban User**: Temporarily disable user account
- **Unban User**: Restore user account access
- **Change Role**: Promote/demote user roles
- **View Details**: See user profile and activity

### User Filters
- Search by username or email
- Filter by role (admin, user, guest)
- Filter by status (active, banned)
- Pagination for large user lists

## Content Moderation Features

### Flag Management
- View all flagged content
- Separate tabs for questions and answers
- Flag reason categorization:
  - Spam
  - Inappropriate content
  - Offensive language
  - Duplicate content
  - Other violations

### Moderation Actions
- **Remove Flags**: Approve content and clear flags
- **Warn Author**: Send notification to content creator
- **Delete Content**: Remove inappropriate content entirely

### Flag Details
- Flag reason and description
- User who reported the flag
- Timestamp of flag
- Content preview

## Dashboard Analytics

### Key Metrics
- **Total Users**: Complete user count
- **Total Questions**: All questions posted
- **Total Answers**: All answers provided
- **Banned Users**: Users with restricted access
- **Flagged Content**: Content requiring review

### User Growth Chart
- Daily user registration trends
- Last 30 days visualization
- Growth rate analysis

### Recent Activity
- Latest user registrations
- Recent question posts
- Quick access to user profiles

## Technical Implementation

### Frontend Components
- `AdminLogin.tsx` - Secure admin login
- `AdminDashboard.tsx` - Main dashboard with statistics
- `AdminUsers.tsx` - User management interface
- `AdminFlagged.tsx` - Content moderation interface
- `AdminLayout.tsx` - Admin panel layout with navigation
- `AdminContext.tsx` - Admin authentication context

### Backend Routes
- `routes/admin.js` - All admin API endpoints
- Middleware protection for admin routes
- Comprehensive error handling

### Database Models
- Enhanced User model with admin role
- Question and Answer models with flag support
- Notification system for admin actions

## Best Practices

### Security
1. Always change the default admin password
2. Use strong, unique passwords
3. Regularly review admin access logs
4. Monitor for suspicious activity

### Moderation
1. Review flagged content promptly
2. Apply consistent moderation policies
3. Document moderation decisions
4. Communicate with users when appropriate

### User Management
1. Use ban/unban judiciously
2. Document role changes
3. Monitor user activity patterns
4. Maintain user privacy

## Troubleshooting

### Common Issues

**Admin can't log in:**
- Verify admin user exists in database
- Check if user role is set to 'admin'
- Ensure password is correct

**Admin routes not accessible:**
- Verify admin middleware is working
- Check JWT token validity
- Ensure proper route configuration

**Dashboard not loading:**
- Check database connection
- Verify API endpoints are working
- Check browser console for errors

### Support

For technical support or feature requests, please refer to the main project documentation or create an issue in the project repository.

## Future Enhancements

Potential features for future versions:
- Advanced analytics and reporting
- Bulk user management
- Automated content filtering
- Audit logs for admin actions
- Email notifications for admins
- Mobile-responsive admin interface
- API rate limiting dashboard
- User activity tracking
- Content quality scoring
- Automated moderation tools 