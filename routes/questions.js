const express = require('express');
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { protect, optionalAuth, checkReputation } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const status = req.query.status || 'open';

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    if (status !== 'all') {
      query.status = status;
    }

    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder;

    const questions = await Question.find(query)
      .populate('author', 'username profile.firstName profile.lastName reputation')
      .populate('acceptedAnswer', 'content author')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);

    // Add user vote information if authenticated
    if (req.user) {
      questions.forEach(question => {
        question.userVote = question.hasUserVoted(req.user._id);
        question.canVote = question.canUserVote(req.user);
        question.canDownvote = question.canUserDownvote(req.user);
      });
    }

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions'
    });
  }
});

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName reputation')
      .populate('acceptedAnswer', 'content author')
      .populate('votes.upvotes.user', 'username')
      .populate('votes.downvotes.user', 'username');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Increment view count
    await question.incrementViewCount();

    // Add user vote information if authenticated
    if (req.user) {
      question.userVote = question.hasUserVoted(req.user._id);
      question.canVote = question.canUserVote(req.user);
      question.canDownvote = question.canUserDownvote(req.user);
    }

    res.json({
      success: true,
      data: { question }
    });

  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching question'
    });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post('/', protect, checkReputation(1), [
  body('title')
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .isLength({ min: 20 })
    .withMessage('Content must be at least 20 characters long'),
  body('tags')
    .isArray({ min: 1, max: 5 })
    .withMessage('Must provide 1-5 tags'),
  body('tags.*')
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters')
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

    const { title, content, tags } = req.body;

    // Normalize tags
    const normalizedTags = tags.map(tag => tag.toLowerCase().trim());

    const question = new Question({
      title,
      content,
      tags: normalizedTags,
      author: req.user._id
    });

    await question.save();

    // Populate author info
    await question.populate('author', 'username profile.firstName profile.lastName reputation');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { question }
    });

  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating question'
    });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Private
router.put('/:id', protect, [
  body('title')
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .optional()
    .isLength({ min: 20 })
    .withMessage('Content must be at least 20 characters long'),
  body('tags')
    .optional()
    .isArray({ min: 1, max: 5 })
    .withMessage('Must provide 1-5 tags'),
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters')
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

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user can edit (author or admin)
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this question'
      });
    }

    const { title, content, tags, reason } = req.body;

    // Add to edit history
    question.editHistory.push({
      content: question.content,
      editedAt: new Date(),
      editedBy: req.user._id,
      reason: reason || 'Updated question'
    });

    // Update fields
    if (title !== undefined) question.title = title;
    if (content !== undefined) question.content = content;
    if (tags !== undefined) {
      question.tags = tags.map(tag => tag.toLowerCase().trim());
    }

    question.isEdited = true;
    await question.save();

    // Populate author info
    await question.populate('author', 'username profile.firstName profile.lastName reputation');

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question }
    });

  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating question'
    });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user can delete (author or admin)
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question'
      });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: question._id });

    // Delete the question
    await Question.findByIdAndDelete(question._id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting question'
    });
  }
});

// @route   POST /api/questions/:id/vote
// @desc    Vote on a question
// @access  Private
router.post('/:id/vote', protect, checkReputation(15), [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be upvote or downvote')
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

    const { voteType } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user can vote
    if (!question.canUserVote(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Minimum reputation of 15 required to vote'
      });
    }

    // Check if user can downvote
    if (voteType === 'downvote' && !question.canUserDownvote(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Minimum reputation of 125 required to downvote'
      });
    }

    // Check if user is voting on their own question
    if (question.author.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own question'
      });
    }

    await question.addVote(req.user._id, voteType);

    // Populate author info
    await question.populate('author', 'username profile.firstName profile.lastName reputation');

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: { question }
    });

  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording vote'
    });
  }
});

// @route   POST /api/questions/:id/bookmark
// @desc    Bookmark/unbookmark a question
// @access  Private
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const existingBookmark = question.bookmarks.find(
      bookmark => bookmark.user.toString() === req.user._id.toString()
    );

    if (existingBookmark) {
      // Remove bookmark
      question.bookmarks = question.bookmarks.filter(
        bookmark => bookmark.user.toString() !== req.user._id.toString()
      );
    } else {
      // Add bookmark
      question.bookmarks.push({
        user: req.user._id,
        createdAt: new Date()
      });
    }

    await question.save();

    res.json({
      success: true,
      message: existingBookmark ? 'Bookmark removed' : 'Question bookmarked',
      data: { isBookmarked: !existingBookmark }
    });

  } catch (error) {
    console.error('Bookmark question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating bookmark'
    });
  }
});

// @route   POST /api/questions/:id/flag
// @desc    Flag a question
// @access  Private
router.post('/:id/flag', protect, [
  body('reason')
    .isIn(['spam', 'inappropriate', 'duplicate', 'offensive', 'other'])
    .withMessage('Invalid flag reason'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
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

    const { reason, description } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user already flagged this question
    const existingFlag = question.flags.find(
      flag => flag.user.toString() === req.user._id.toString()
    );

    if (existingFlag) {
      return res.status(400).json({
        success: false,
        message: 'You have already flagged this question'
      });
    }

    question.flags.push({
      user: req.user._id,
      reason,
      description,
      createdAt: new Date()
    });

    await question.save();

    res.json({
      success: true,
      message: 'Question flagged successfully'
    });

  } catch (error) {
    console.error('Flag question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while flagging question'
    });
  }
});

module.exports = router; 