const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder;

    const users = await User.find(query)
      .select('username profile badges isVerified lastSeen createdAt')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username profile badges isVerified lastSeen createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, bio, location, website } = req.body;

    // Update profile fields
    if (firstName !== undefined) req.user.profile.firstName = firstName;
    if (lastName !== undefined) req.user.profile.lastName = lastName;
    if (bio !== undefined) req.user.profile.bio = bio;
    if (location !== undefined) req.user.profile.location = location;
    if (website !== undefined) req.user.profile.website = website;

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, [
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean'),
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { emailNotifications, pushNotifications, theme } = req.body;

    // Update preference fields
    if (emailNotifications !== undefined) req.user.preferences.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) req.user.preferences.pushNotifications = pushNotifications;
    if (theme !== undefined) req.user.preferences.theme = theme;

    await req.user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: req.user.preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating preferences'
    });
  }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('New password must contain at least one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, [
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // TODO: Delete user's questions, answers, and other data
    // For now, just delete the user
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
});

// Admin routes
// @route   PUT /api/users/:id/ban
// @desc    Ban user (admin only)
// @access  Private/Admin
router.put('/:id/ban', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBanned = true;
    await user.save();

    res.json({
      success: true,
      message: 'User banned successfully'
    });

  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while banning user'
    });
  }
});

// @route   PUT /api/users/:id/unban
// @desc    Unban user (admin only)
// @access  Private/Admin
router.put('/:id/unban', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBanned = false;
    await user.save();

    res.json({
      success: true,
      message: 'User unbanned successfully'
    });

  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unbanning user'
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Change user role (admin only)
// @access  Private/Admin
router.put('/:id/role', protect, authorize('admin'), [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing user role'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get current user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const Question = require('../models/Question');
    const Answer = require('../models/Answer');

    // Get questions asked by user
    const questionsAsked = await Question.countDocuments({ author: req.user._id });
    
    // Get answers given by user
    const answersGiven = await Answer.countDocuments({ author: req.user._id });
    
    // Get total upvotes received on questions
    const questionUpvotes = await Question.aggregate([
      { $match: { author: req.user._id } },
      { $unwind: '$votes.upvotes' },
      { $count: 'total' }
    ]);
    const totalQuestionUpvotes = questionUpvotes.length > 0 ? questionUpvotes[0].total : 0;
    
    // Get total upvotes received on answers
    const answerUpvotes = await Answer.aggregate([
      { $match: { author: req.user._id } },
      { $unwind: '$votes.upvotes' },
      { $count: 'total' }
    ]);
    const totalAnswerUpvotes = answerUpvotes.length > 0 ? answerUpvotes[0].total : 0;
    
    // Get total downvotes received on questions
    const questionDownvotes = await Question.aggregate([
      { $match: { author: req.user._id } },
      { $unwind: '$votes.downvotes' },
      { $count: 'total' }
    ]);
    const totalQuestionDownvotes = questionDownvotes.length > 0 ? questionDownvotes[0].total : 0;
    
    // Get total downvotes received on answers
    const answerDownvotes = await Answer.aggregate([
      { $match: { author: req.user._id } },
      { $unwind: '$votes.downvotes' },
      { $count: 'total' }
    ]);
    const totalAnswerDownvotes = answerDownvotes.length > 0 ? answerDownvotes[0].total : 0;

    // Calculate total reputation (upvotes - downvotes)
    const totalReputation = (totalQuestionUpvotes + totalAnswerUpvotes) - (totalQuestionDownvotes + totalAnswerDownvotes);

    // Get accepted answers count
    const acceptedAnswers = await Answer.countDocuments({ 
      author: req.user._id, 
      isAccepted: true 
    });

    res.json({
      success: true,
      data: {
        questionsAsked,
        answersGiven,
        totalReputation,
        acceptedAnswers,
        questionUpvotes: totalQuestionUpvotes,
        questionDownvotes: totalQuestionDownvotes,
        answerUpvotes: totalAnswerUpvotes,
        answerDownvotes: totalAnswerDownvotes
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

module.exports = router; 