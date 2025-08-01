const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Question content is required'],
    minlength: [20, 'Content must be at least 20 characters long']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
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
  viewCount: {
    type: Number,
    default: 0
  },
  answerCount: {
    type: Number,
    default: 0
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'duplicate', 'on-hold'],
    default: 'open'
  },
  bounty: {
    amount: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      default: null
    }
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
  bookmarks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
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
      enum: ['spam', 'inappropriate', 'duplicate', 'offensive', 'other'],
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
questionSchema.index({ title: 'text', content: 'text' });
questionSchema.index({ tags: 1 });
questionSchema.index({ author: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ 'votes.upvotes': -1 });
questionSchema.index({ viewCount: -1 });
questionSchema.index({ answerCount: -1 });

// Virtual for vote count
questionSchema.virtual('voteCount').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Virtual for bookmark count
questionSchema.virtual('bookmarkCount').get(function() {
  return this.bookmarks.length;
});

// Method to check if user has voted
questionSchema.methods.hasUserVoted = function(userId) {
  const upvoted = this.votes.upvotes.some(vote => vote.user.toString() === userId.toString());
  const downvoted = this.votes.downvotes.some(vote => vote.user.toString() === userId.toString());
  
  if (upvoted) return 'upvote';
  if (downvoted) return 'downvote';
  return null;
};

// Method to add vote
questionSchema.methods.addVote = function(userId, voteType) {
  const voteData = {
    user: userId,
    createdAt: new Date()
  };

  const currentVote = this.hasUserVoted(userId);

  // If clicking the same vote type, remove the vote (toggle off)
  if (currentVote === voteType) {
    if (voteType === 'upvote') {
      this.votes.upvotes = this.votes.upvotes.filter(vote => vote.user.toString() !== userId.toString());
    } else {
      this.votes.downvotes = this.votes.downvotes.filter(vote => vote.user.toString() !== userId.toString());
    }
  } else {
    // Remove existing vote of opposite type
    if (voteType === 'upvote') {
      this.votes.downvotes = this.votes.downvotes.filter(vote => vote.user.toString() !== userId.toString());
      this.votes.upvotes.push(voteData);
    } else {
      this.votes.upvotes = this.votes.upvotes.filter(vote => vote.user.toString() !== userId.toString());
      this.votes.downvotes.push(voteData);
    }
  }

  return this.save();
};

// Method to increment view count
questionSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to update answer count
questionSchema.methods.updateAnswerCount = function() {
  return this.model('Answer').countDocuments({ question: this._id })
    .then(count => {
      this.answerCount = count;
      return this.save();
    });
};

// Method to check if user can vote (no reputation check needed)
questionSchema.methods.canUserVote = function(user) {
  if (!user) return false;
  return true; // All authenticated users can vote
};

// Method to check if user can downvote (no reputation check needed)
questionSchema.methods.canUserDownvote = function(user) {
  if (!user) return false;
  return true; // All authenticated users can downvote
};

// Ensure virtual fields are serialized
questionSchema.set('toJSON', { virtuals: true });
questionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema); 