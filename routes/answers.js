const express = require('express');
const { body, validationResult } = require('express-validator');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { protect, checkReputation } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/answers/question/:questionId
// @desc    Get all answers for a question
// @access  Public
router.get('/question/:questionId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'voteCount';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder;

    const answers = await Answer.find({ question: req.params.questionId })
      .populate('author', 'username profile.firstName profile.lastName reputation')
      .populate('comments.author', 'username profile.firstName profile.lastName')
      .populate('votes.upvotes.user', 'username')
      .populate('votes.downvotes.user', 'username')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Answer.countDocuments({ question: req.params.questionId });

    res.json({
      success: true,
      data: {
        answers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching answers'
    });
  }
});

// @route   GET /api/answers/:id
// @desc    Get answer by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName reputation')
      .populate('comments.author', 'username profile.firstName profile.lastName')
      .populate('votes.upvotes.user', 'username')
      .populate('votes.downvotes.user', 'username');

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    res.json({
      success: true,
      data: { answer }
    });

  } catch (error) {
    console.error('Get answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching answer'
    });
  }
});

// @route   POST /api/answers
// @desc    Create a new answer
// @access  Private
router.post('/', protect, checkReputation(1), [
  body('content')
    .isLength({ min: 20 })
    .withMessage('Content must be at least 20 characters long'),
  body('questionId')
    .isMongoId()
    .withMessage('Valid question ID is required')
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

    const { content, questionId } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user already answered this question
    const existingAnswer = await Answer.findOne({
      question: questionId,
      author: req.user._id
    });

    if (existingAnswer) {
      return res.status(400).json({
        success: false,
        message: 'You have already answered this question'
      });
    }

    const answer = new Answer({
      content,
      author: req.user._id,
      question: questionId
    });

    await answer.save();

    // Update question's answer count
    await question.updateAnswerCount();

    // Populate author info
    await answer.populate('author', 'username profile.firstName profile.lastName reputation');

    res.status(201).json({
      success: true,
      message: 'Answer posted successfully',
      data: { answer }
    });

  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating answer'
    });
  }
});

// @route   PUT /api/answers/:id
// @desc    Update an answer
// @access  Private
router.put('/:id', protect, [
  body('content')
    .isLength({ min: 20 })
    .withMessage('Content must be at least 20 characters long')
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

    const { content, reason } = req.body;

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user can edit (author or admin)
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this answer'
      });
    }

    // Add to edit history
    answer.editHistory.push({
      content: answer.content,
      editedAt: new Date(),
      editedBy: req.user._id,
      reason: reason || 'Updated answer'
    });

    answer.content = content;
    answer.isEdited = true;
    await answer.save();

    // Populate author info
    await answer.populate('author', 'username profile.firstName profile.lastName reputation');

    res.json({
      success: true,
      message: 'Answer updated successfully',
      data: { answer }
    });

  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating answer'
    });
  }
});

// @route   DELETE /api/answers/:id
// @desc    Delete an answer
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user can delete (author or admin)
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this answer'
      });
    }

    // Update question's answer count
    const question = await Question.findById(answer.question);
    if (question) {
      await question.updateAnswerCount();
    }

    // Delete the answer
    await Answer.findByIdAndDelete(answer._id);

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });

  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting answer'
    });
  }
});

// @route   POST /api/answers/:id/vote
// @desc    Vote on an answer
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

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user can vote
    if (!answer.canUserVote(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Minimum reputation of 15 required to vote'
      });
    }

    // Check if user can downvote
    if (voteType === 'downvote' && !answer.canUserDownvote(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Minimum reputation of 125 required to downvote'
      });
    }

    // Check if user is voting on their own answer
    if (answer.author.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own answer'
      });
    }

    await answer.addVote(req.user._id, voteType);

    // Populate author info
    await answer.populate('author', 'username profile.firstName profile.lastName reputation');

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: { answer }
    });

  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording vote'
    });
  }
});

// @route   POST /api/answers/:id/accept
// @desc    Accept an answer (question owner only)
// @access  Private
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Get the question to check ownership
    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the question owner
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question owner can accept answers'
      });
    }

    // Check if answer is already accepted
    if (answer.isAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Answer is already accepted'
      });
    }

    await answer.acceptAnswer(req.user._id);

    // Populate author info
    await answer.populate('author', 'username profile.firstName profile.lastName reputation');

    res.json({
      success: true,
      message: 'Answer accepted successfully',
      data: { answer }
    });

  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting answer'
    });
  }
});

// @route   POST /api/answers/:id/unaccept
// @desc    Unaccept an answer (question owner only)
// @access  Private
router.post('/:id/unaccept', protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Get the question to check ownership
    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the question owner
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question owner can unaccept answers'
      });
    }

    // Check if answer is accepted
    if (!answer.isAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Answer is not accepted'
      });
    }

    await answer.unacceptAnswer();

    // Populate author info
    await answer.populate('author', 'username profile.firstName profile.lastName reputation');

    res.json({
      success: true,
      message: 'Answer unaccepted successfully',
      data: { answer }
    });

  } catch (error) {
    console.error('Unaccept answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unaccepting answer'
    });
  }
});

// @route   POST /api/answers/:id/comments
// @desc    Add a comment to an answer
// @access  Private
router.post('/:id/comments', protect, checkReputation(50), [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
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

    const { content } = req.body;

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    await answer.addComment(req.user._id, content);

    // Populate author info
    await answer.populate('author', 'username profile.firstName profile.lastName reputation');
    await answer.populate('comments.author', 'username profile.firstName profile.lastName');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { answer }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
});

// @route   PUT /api/answers/:id/comments/:commentId
// @desc    Update a comment
// @access  Private
router.put('/:id/comments/:commentId', protect, [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
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

    const { content } = req.body;

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    await answer.updateComment(req.params.commentId, req.user._id, content);

    // Populate author info
    await answer.populate('author', 'username profile.firstName profile.lastName reputation');
    await answer.populate('comments.author', 'username profile.firstName profile.lastName');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { answer }
    });

  } catch (error) {
    console.error('Update comment error:', error);
    if (error.message.includes('not found') || error.message.includes('authorized')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating comment'
    });
  }
});

// @route   DELETE /api/answers/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    await answer.removeComment(req.params.commentId, req.user._id);

    // Populate author info
    await answer.populate('author', 'username profile.firstName profile.lastName reputation');
    await answer.populate('comments.author', 'username profile.firstName profile.lastName');

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: { answer }
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    if (error.message.includes('not found') || error.message.includes('authorized')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting comment'
    });
  }
});

module.exports = router; 