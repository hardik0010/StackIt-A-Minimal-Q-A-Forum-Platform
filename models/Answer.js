const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    minlength: [20, 'Content must be at least 20 characters long']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  votes: {
    upvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    downvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }],
  comments: [{
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'offensive', 'other'],
      required: true
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
answerSchema.index({ question: 1, createdAt: 1 });
answerSchema.index({ author: 1 });
answerSchema.index({ isAccepted: 1 });
answerSchema.index({ 'votes.upvotes': -1 });

// Virtual for vote count
answerSchema.virtual('voteCount').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Virtual for comment count
answerSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if user has voted
answerSchema.methods.hasUserVoted = function(userId) {
  const upvoted = this.votes.upvotes.some(vote => vote.user.toString() === userId.toString());
  const downvoted = this.votes.downvotes.some(vote => vote.user.toString() === userId.toString());
  
  if (upvoted) return 'upvote';
  if (downvoted) return 'downvote';
  return null;
};

// Method to add vote
answerSchema.methods.addVote = function(userId, voteType) {
  const voteData = {
    user: userId,
    createdAt: new Date()
  };

  // Remove existing vote
  this.votes.upvotes = this.votes.upvotes.filter(vote => vote.user.toString() !== userId.toString());
  this.votes.downvotes = this.votes.downvotes.filter(vote => vote.user.toString() !== userId.toString());

  // Add new vote
  if (voteType === 'upvote') {
    this.votes.upvotes.push(voteData);
  } else if (voteType === 'downvote') {
    this.votes.downvotes.push(voteData);
  }

  return this.save();
};

// Method to accept answer
answerSchema.methods.acceptAnswer = function(userId) {
  this.isAccepted = true;
  this.acceptedAt = new Date();
  this.acceptedBy = userId;
  
  // Update the question's accepted answer
  return this.model('Question').findByIdAndUpdate(
    this.question,
    { acceptedAnswer: this._id },
    { new: true }
  ).then(() => this.save());
};

// Method to unaccept answer
answerSchema.methods.unacceptAnswer = function() {
  this.isAccepted = false;
  this.acceptedAt = null;
  this.acceptedBy = null;
  
  // Remove the question's accepted answer
  return this.model('Question').findByIdAndUpdate(
    this.question,
    { acceptedAnswer: null },
    { new: true }
  ).then(() => this.save());
};

// Method to add comment
answerSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    content,
    author: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return this.save();
};

// Method to update comment
answerSchema.methods.updateComment = function(commentId, userId, content) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  if (comment.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to edit this comment');
  }
  
  comment.content = content;
  comment.updatedAt = new Date();
  return this.save();
};

// Method to remove comment
answerSchema.methods.removeComment = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  if (comment.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this comment');
  }
  
  comment.remove();
  return this.save();
};

// Method to check if user can vote (reputation check)
answerSchema.methods.canUserVote = function(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.reputation >= 15; // Minimum reputation to vote
};

// Method to check if user can downvote
answerSchema.methods.canUserDownvote = function(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.reputation >= 125; // Higher reputation required for downvoting
};

// Ensure virtual fields are serialized
answerSchema.set('toJSON', { virtuals: true });
answerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Answer', answerSchema); 