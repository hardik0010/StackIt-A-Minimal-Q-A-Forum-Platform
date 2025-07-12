const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const Question = require('../models/Question');
const router = express.Router();

// Popular programming and technology tags
const POPULAR_TAGS = [
  'javascript', 'python', 'java', 'react', 'nodejs', 'typescript',
  'html', 'css', 'php', 'c++', 'c#', 'ruby', 'go', 'rust',
  'angular', 'vue', 'express', 'django', 'flask', 'spring',
  'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes',
  'aws', 'azure', 'git', 'linux', 'windows', 'macos',
  'algorithm', 'data-structure', 'machine-learning', 'ai', 'blockchain',
  'webpack', 'babel', 'jest', 'cypress', 'selenium', 'graphql',
  'nextjs', 'nuxt', 'laravel', 'symfony', 'asp.net', 'dotnet',
  'swift', 'kotlin', 'scala', 'haskell', 'elixir', 'clojure',
  'firebase', 'heroku', 'vercel', 'netlify', 'digitalocean',
  'nginx', 'apache', 'jenkins', 'travis-ci', 'github-actions',
  'redux', 'mobx', 'vuex', 'pinia', 'tailwindcss', 'bootstrap',
  'material-ui', 'ant-design', 'chakra-ui', 'styled-components',
  'socket.io', 'websocket', 'rest-api', 'microservices', 'serverless'
];

// Simple in-memory cache for tag suggestions
const suggestionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache management
const getCachedSuggestions = (searchTerm) => {
  const cached = suggestionCache.get(searchTerm);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.suggestions;
  }
  return null;
};

const setCachedSuggestions = (searchTerm, suggestions) => {
  suggestionCache.set(searchTerm, {
    suggestions,
    timestamp: Date.now()
  });
};

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of suggestionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      suggestionCache.delete(key);
    }
  }
}, CACHE_TTL);

// @route   GET /api/tags
// @desc    Get all tags with usage count
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const search = req.query.search || '';
    const limit = parseInt(req.query.limit) || 50;

    // Get tags from existing questions
    const questionTags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    // Combine with popular tags and remove duplicates
    const allTags = [...POPULAR_TAGS];
    questionTags.forEach(tag => {
      if (!allTags.includes(tag._id)) {
        allTags.push(tag._id);
      }
    });

    // Filter by search term if provided
    let filteredTags = allTags;
    if (search) {
      filteredTags = allTags.filter(tag => 
        tag.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Limit results
    filteredTags = filteredTags.slice(0, limit);

    // Create response with usage count
    const tagsWithCount = filteredTags.map(tag => {
      const questionTag = questionTags.find(qt => qt._id === tag);
      return {
        name: tag,
        count: questionTag ? questionTag.count : 0
      };
    });

    res.json({
      success: true,
      data: {
        tags: tagsWithCount
      }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tags'
    });
  }
});

// @route   GET /api/tags/popular
// @desc    Get popular tags
// @access  Public
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get most used tags from questions
    const popularTags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      data: {
        tags: popularTags.map(tag => ({
          name: tag._id,
          count: tag.count
        }))
      }
    });
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular tags'
    });
  }
});

// @route   GET /api/tags/suggestions
// @desc    Get tag suggestions based on search term
// @access  Public
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const search = req.query.search || '';
    const limit = parseInt(req.query.limit) || 10;

    if (!search) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchLower = search.toLowerCase();

    // Check cache first
    const cachedSuggestions = getCachedSuggestions(searchLower);
    if (cachedSuggestions) {
      return res.json({
        success: true,
        data: { suggestions: cachedSuggestions.slice(0, limit) }
      });
    }

    // Get matching popular tags first (faster)
    const popularMatches = POPULAR_TAGS.filter(tag => 
      tag.toLowerCase().includes(searchLower)
    );

    // If we have enough popular matches, return them immediately
    if (popularMatches.length >= limit) {
      const suggestions = popularMatches.slice(0, limit);
      setCachedSuggestions(searchLower, suggestions);
      return res.json({
        success: true,
        data: { suggestions }
      });
    }

    // Get matching tags from questions (only if needed)
    let questionMatches = [];
    if (popularMatches.length < limit) {
      questionMatches = await Question.aggregate([
        { $unwind: '$tags' },
        { $match: { tags: { $regex: searchLower, $options: 'i' } } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit - popularMatches.length }
      ]);
    }

    // Combine and deduplicate
    const allSuggestions = [...popularMatches];
    questionMatches.forEach(tag => {
      if (!allSuggestions.includes(tag._id)) {
        allSuggestions.push(tag._id);
      }
    });

    // Limit results
    const suggestions = allSuggestions.slice(0, limit);

    // Cache the results
    setCachedSuggestions(searchLower, suggestions);

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get tag suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tag suggestions'
    });
  }
});

// @route   POST /api/tags
// @desc    Create a new tag (for future use)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.length < 1 || name.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Tag name must be between 1 and 20 characters'
      });
    }

    // Check if tag already exists in questions
    const existingTag = await Question.findOne({ tags: name.toLowerCase() });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag already exists'
      });
    }

    // For now, just return success since tags are created when questions are posted
    res.status(201).json({
      success: true,
      message: 'Tag will be created when used in a question',
      data: { tag: name.toLowerCase() }
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tag'
    });
  }
});

module.exports = router; 