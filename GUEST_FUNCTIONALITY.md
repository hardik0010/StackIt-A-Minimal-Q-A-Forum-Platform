# Guest Functionality Implementation

## Overview

The StackIt application now supports guest users who can browse and view content without creating an account, but are restricted from performing interactive actions. This encourages user registration while still providing value to visitors.

## Guest User Capabilities

### ✅ What Guests CAN Do

1. **Browse Questions**
   - View all questions on the public dashboard
   - Search questions by title, content, or tags
   - Click on question titles to view full details
   - See question metadata (author, date, views, votes, answers)

2. **View Question Details**
   - Read full question content
   - View all answers to questions
   - See answer metadata and vote counts
   - Browse tags and question information

3. **Search and Filter**
   - Use the search functionality to find questions
   - Filter by tags (when implemented)
   - Sort questions by various criteria

### ❌ What Guests CANNOT Do

1. **Interactive Actions**
   - Vote on questions or answers
   - Post new questions
   - Submit answers to questions
   - Comment on questions or answers
   - Edit or delete content

2. **User-Specific Features**
   - Access user dashboard
   - View user profiles
   - Receive notifications
   - Track badges and achievements

## Implementation Details

### Frontend Components

#### 1. PublicDashboard (`client/src/pages/PublicDashboard.tsx`)
- Main landing page for all users
- Shows guest notice banner for unauthenticated users
- Displays questions with restricted interactive elements
- Provides clear CTAs to register/login

#### 2. QuestionDetail (`client/src/pages/QuestionDetail.tsx`)
- Individual question view page
- Shows question content and all answers
- Restricts voting and answering for guests
- Provides guest-specific messaging

#### 3. GuestRestriction (`client/src/components/GuestRestriction.tsx`)
- Reusable component for showing guest limitations
- Consistent styling and messaging
- Built-in CTAs to register/login

#### 4. useGuestActions Hook (`client/src/hooks/useGuestActions.ts`)
- Centralized logic for handling guest actions
- Provides consistent toast notifications
- Handles authentication requirements

### Backend Support

The backend already supports guest functionality through:

1. **Public Routes**
   - `GET /api/questions` - List all questions (public)
   - `GET /api/questions/:id` - Get specific question (public)
   - `GET /api/answers/question/:questionId` - Get answers for question (public)

2. **Protected Routes**
   - `POST /api/questions` - Create question (requires auth)
   - `POST /api/answers` - Create answer (requires auth)
   - `PUT /api/questions/:id` - Update question (requires auth)
   - `PUT /api/answers/:id` - Update answer (requires auth)

3. **Optional Authentication Middleware**
   - `optionalAuth` middleware allows routes to work with or without authentication
   - Provides user context when available
   - Gracefully handles missing tokens

## User Experience Features

### 1. Guest Notice Banner
- Clear indication that user is browsing as guest
- Explains limitations and benefits of registration
- Direct links to signup/login pages

### 2. Interactive Element Restrictions
- Disabled voting buttons with visual indicators
- Locked action buttons with appropriate messaging
- Hover tooltips explaining restrictions

### 3. Call-to-Action Sections
- Prominent signup/login buttons throughout the interface
- Contextual CTAs when guests try to perform restricted actions
- Gradient CTA section at bottom of public dashboard

### 4. Toast Notifications
- Informative error messages when guests try restricted actions
- Consistent messaging across the application
- Clear guidance on how to gain access

## Technical Implementation

### Authentication Flow
```typescript
// Example usage of useGuestActions hook
const { requireAuth, handleGuestAction } = useGuestActions();

const handleVote = (questionId: string) => {
  requireAuth('vote', () => {
    // Actual voting logic here
    performVote(questionId);
  });
};
```

### Route Protection
```typescript
// Public route - accessible to all users
<Route path="/" element={<PublicDashboard />} />

// Protected route - requires authentication
<Route path="/ask" element={
  <ProtectedRoute>
    <AskQuestion />
  </ProtectedRoute>
} />
```

### Guest Action Handling
```typescript
// Consistent guest action messaging
const handleGuestAction = (action: string) => {
  toast.error(`Please ${isAuthenticated ? 'log in' : 'sign up'} to ${action}`, {
    duration: 4000,
    icon: <Lock className="h-4 w-4" />,
  });
};
```

## Benefits

1. **Improved User Acquisition**
   - Guests can explore content before committing
   - Clear value proposition through content preview
   - Low-friction path to registration

2. **Better SEO**
   - Public content is indexable by search engines
   - Improved discoverability of questions and answers
   - Better user engagement metrics

3. **Enhanced User Experience**
   - No forced registration for content consumption
   - Clear expectations about functionality
   - Smooth transition from guest to registered user

4. **Community Growth**
   - More users can discover the platform
   - Increased content visibility
   - Better conversion from visitors to active users

## Future Enhancements

1. **Social Sharing**
   - Allow guests to share questions on social media
   - Implement Open Graph meta tags for better sharing

2. **Guest Analytics**
   - Track guest behavior and conversion rates
   - Identify popular content for guests

3. **Progressive Enhancement**
   - Allow limited guest interactions (e.g., view-only bookmarks)
   - Implement guest-specific features

4. **Content Curation**
   - Show featured questions to guests
   - Highlight best answers and top contributors 