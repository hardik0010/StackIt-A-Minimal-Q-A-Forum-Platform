const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

// Admin middleware - only allow admin access
const adminOnly = authorize('admin');

// Get admin dashboard statistics
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalAnswers,
      bannedUsers,
      flaggedQuestions,
      flaggedAnswers,
      recentUsers,
      recentQuestions
    ] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Answer.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Question.countDocuments({ 'flags.0': { $exists: true } }),
      Answer.countDocuments({ 'flags.0': { $exists: true } }),
      User.find().sort({ createdAt: -1 }).limit(5).select('username email createdAt'),
      Question.find().sort({ createdAt: -1 }).limit(5).populate('author', 'username')
    ]);

    // Get user growth data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalQuestions,
          totalAnswers,
          bannedUsers,
          flaggedQuestions,
          flaggedAnswers
        },
        recentUsers,
        recentQuestions,
        userGrowth
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// Get all users with pagination and filters
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const isBanned = req.query.isBanned;

    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isBanned !== undefined) {
      query.isBanned = isBanned === 'true';
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

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
      message: 'Error fetching users'
    });
  }
});

// Update user (ban/unban, change role)
router.patch('/users/:userId', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBanned, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from banning themselves
    if (user._id.toString() === req.user._id.toString() && isBanned) {
      return res.status(400).json({
        success: false,
        message: 'You cannot ban yourself'
      });
    }

    const updateData = {};
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Send notification to user if banned/unbanned
    if (isBanned !== undefined) {
      const notification = new Notification({
        recipient: userId,
        type: isBanned ? 'account_banned' : 'account_unbanned',
        title: isBanned ? 'Account Banned' : 'Account Unbanned',
        message: isBanned 
          ? 'Your account has been banned by an administrator.'
          : 'Your account has been unbanned by an administrator.',
        createdBy: req.user._id
      });
      await notification.save();
    }

    res.json({
      success: true,
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// Get flagged content
router.get('/flagged', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || 'all'; // 'questions', 'answers', 'all'

    const skip = (page - 1) * limit;

    let flaggedQuestions = [];
    let flaggedAnswers = [];
    let totalQuestions = 0;
    let totalAnswers = 0;

    if (type === 'all' || type === 'questions') {
      [flaggedQuestions, totalQuestions] = await Promise.all([
        Question.find({ 'flags.0': { $exists: true } })
          .populate('author', 'username')
          .populate('flags.user', 'username')
          .sort({ 'flags.createdAt': -1 })
          .skip(skip)
          .limit(limit),
        Question.countDocuments({ 'flags.0': { $exists: true } })
      ]);
    }

    if (type === 'all' || type === 'answers') {
      [flaggedAnswers, totalAnswers] = await Promise.all([
        Answer.find({ 'flags.0': { $exists: true } })
          .populate('author', 'username')
          .populate('question', 'title')
          .populate('flags.user', 'username')
          .sort({ 'flags.createdAt': -1 })
          .skip(skip)
          .limit(limit),
        Answer.countDocuments({ 'flags.0': { $exists: true } })
      ]);
    }

    res.json({
      success: true,
      data: {
        flaggedQuestions,
        flaggedAnswers,
        pagination: {
          page,
          limit,
          totalQuestions,
          totalAnswers
        }
      }
    });
  } catch (error) {
    console.error('Get flagged content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flagged content'
    });
  }
});

// Resolve flag (remove flag and optionally take action)
router.post('/flags/:contentType/:contentId/resolve', protect, adminOnly, async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { action, reason } = req.body; // action: 'remove', 'delete', 'warn'

    let content;
    if (contentType === 'question') {
      content = await Question.findById(contentId);
    } else if (contentType === 'answer') {
      content = await Answer.findById(contentId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Clear all flags
    content.flags = [];
    await content.save();

    // Take additional action if specified
    if (action === 'delete') {
      if (contentType === 'question') {
        // Delete all answers for this question
        await Answer.deleteMany({ question: contentId });
        await Question.findByIdAndDelete(contentId);
      } else {
        await Answer.findByIdAndDelete(contentId);
      }
    } else if (action === 'warn') {
      // Send warning notification to content author
      const notification = new Notification({
        recipient: content.author,
        type: 'content_warning',
        title: 'Content Warning',
        message: `Your ${contentType} has been flagged and reviewed by an administrator. Please ensure your content follows community guidelines.`,
        createdBy: req.user._id
      });
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Flag resolved successfully'
    });
  } catch (error) {
    console.error('Resolve flag error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving flag'
    });
  }
});

// Get system statistics
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      totalQuestions,
      newQuestionsThisMonth,
      newQuestionsThisWeek,
      totalAnswers,
      newAnswersThisMonth,
      newAnswersThisWeek,
      bannedUsers,
      flaggedContent
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: lastMonth } }),
      User.countDocuments({ createdAt: { $gte: lastWeek } }),
      Question.countDocuments(),
      Question.countDocuments({ createdAt: { $gte: lastMonth } }),
      Question.countDocuments({ createdAt: { $gte: lastWeek } }),
      Answer.countDocuments(),
      Answer.countDocuments({ createdAt: { $gte: lastMonth } }),
      Answer.countDocuments({ createdAt: { $gte: lastWeek } }),
      User.countDocuments({ isBanned: true }),
      Question.countDocuments({ 'flags.0': { $exists: true } }) + 
      Answer.countDocuments({ 'flags.0': { $exists: true } })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth,
        newUsersThisWeek,
        totalQuestions,
        newQuestionsThisMonth,
        newQuestionsThisWeek,
        totalAnswers,
        newAnswersThisMonth,
        newAnswersThisWeek,
        bannedUsers,
        flaggedContent
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// --- Admin: List/Edit/Delete Any Question ---
router.get('/questions', protect, adminOnly, async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const query = search ? { $or: [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ] } : {};
    const [questions, total] = await Promise.all([
      Question.find(query).populate('author', 'username').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(query)
    ]);
    res.json({ success: true, data: { questions, pagination: { page, limit, total, pages: Math.ceil(total/limit) } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching questions' });
  }
});
router.patch('/questions/:id', protect, adminOnly, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await AuditLog.create({ action: 'edit_question', actor: req.user._id, target: question._id, targetModel: 'Question', details: req.body });
    res.json({ success: true, data: { question } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error editing question' });
  }
});
router.delete('/questions/:id', protect, adminOnly, async (req, res) => {
  try {
    await Answer.deleteMany({ question: req.params.id });
    await Question.findByIdAndDelete(req.params.id);
    await AuditLog.create({ action: 'delete_question', actor: req.user._id, target: req.params.id, targetModel: 'Question' });
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting question' });
  }
});

// --- Admin: List/Edit/Delete Any Answer ---
router.get('/answers', protect, adminOnly, async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const query = search ? { content: { $regex: search, $options: 'i' } } : {};
    const [answers, total] = await Promise.all([
      Answer.find(query).populate('author', 'username').populate('question', 'title').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Answer.countDocuments(query)
    ]);
    res.json({ success: true, data: { answers, pagination: { page, limit, total, pages: Math.ceil(total/limit) } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching answers' });
  }
});
router.patch('/answers/:id', protect, adminOnly, async (req, res) => {
  try {
    const answer = await Answer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await AuditLog.create({ action: 'edit_answer', actor: req.user._id, target: answer._id, targetModel: 'Answer', details: req.body });
    res.json({ success: true, data: { answer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error editing answer' });
  }
});
router.delete('/answers/:id', protect, adminOnly, async (req, res) => {
  try {
    await Answer.findByIdAndDelete(req.params.id);
    await AuditLog.create({ action: 'delete_answer', actor: req.user._id, target: req.params.id, targetModel: 'Answer' });
    res.json({ success: true, message: 'Answer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting answer' });
  }
});

// --- Admin: Announcements ---
router.post('/announcements', protect, adminOnly, async (req, res) => {
  try {
    const { title, message } = req.body;
    const users = await User.find({});
    const announcement = await Announcement.create({ title, message, createdBy: req.user._id, sentTo: users.map(u => u._id) });
    // Create notifications for all users
    await Promise.all(users.map(user => new Notification({ recipient: user._id, type: 'announcement', title, message, createdBy: req.user._id }).save()));
    await AuditLog.create({ action: 'send_announcement', actor: req.user._id, details: { title, message } });
    res.json({ success: true, data: { announcement } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending announcement' });
  }
});
router.get('/announcements', protect, adminOnly, async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 }).populate('createdBy', 'username');
    res.json({ success: true, data: { announcements } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
});

// --- Admin: Audit Logs ---
router.get('/audit-logs', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const logs = await AuditLog.find({}).populate('actor', 'username').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await AuditLog.countDocuments();
    res.json({ success: true, data: { logs, pagination: { page, limit, total, pages: Math.ceil(total/limit) } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching audit logs' });
  }
});

// --- Admin: Tag Management ---
// List all tags (from questions and popular list)
router.get('/tags', protect, adminOnly, async (req, res) => {
  try {
    // Get tags from existing questions
    const questionTags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: { tags: questionTags } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tags' });
  }
});
// Remove a tag from all questions
router.delete('/tags/:tag', protect, adminOnly, async (req, res) => {
  try {
    const tag = req.params.tag;
    await Question.updateMany({}, { $pull: { tags: tag } });
    await AuditLog.create({ action: 'delete_tag', actor: req.user._id, details: { tag } });
    res.json({ success: true, message: 'Tag removed from all questions' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing tag' });
  }
});

// --- Admin: Site Settings ---
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    const settings = await Settings.find({});
    res.json({ success: true, data: { settings } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});
router.post('/settings', protect, adminOnly, async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Settings.findOneAndUpdate({ key }, { value, updatedAt: new Date() }, { upsert: true, new: true });
    await AuditLog.create({ action: 'update_setting', actor: req.user._id, details: { key, value } });
    res.json({ success: true, data: { setting } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating setting' });
  }
});

// --- Admin: Impersonate User ---
router.post('/impersonate/:userId', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Generate a JWT for the user
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    await AuditLog.create({ action: 'impersonate_user', actor: req.user._id, target: user._id, targetModel: 'User' });
    res.json({ success: true, data: { token, user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error impersonating user' });
  }
});

module.exports = router; 