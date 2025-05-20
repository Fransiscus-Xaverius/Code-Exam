const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Competition = require('../models/Competition');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// @desc    Get all feedbacks
// @route   GET /api/feedbacks
// @access  Private (Admin only)
exports.getFeedbacks = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Add filtering
    const filter = {};

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by rating
    if (req.query.rating) {
      filter.rating = req.query.rating;
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.created_at = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }
    
    // Search by content
    if (req.query.search) {
      filter.content = {
        [Op.like]: `%${req.query.search}%`
      };
    }
    
    // Get feedbacks with count
    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where: filter,
      limit,
      offset: startIndex,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role', 'email']
        },
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title'],
          required: false
        },
        {
          model: Competition,
          as: 'competition',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
    
    // Pagination result
    const pagination = {};
    
    if (startIndex + limit < count) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count,
      pagination,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error getting feedbacks:', error);
    next(error);
  }
};

// @desc    Get feedback stats
// @route   GET /api/feedbacks/stats
// @access  Private (Admin only)
exports.getFeedbackStats = async (req, res, next) => {
  try {
    // Get total count by category
    const categoryStats = await Feedback.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category']
    });
    
    // Get total count by status
    const statusStats = await Feedback.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    // Get average rating
    const avgRating = await Feedback.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average']
      ]
    });
    
    // Get recent feedbacks (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today.setDate(today.getDate() - 7));
    
    const recentFeedbacks = await Feedback.count({
      where: {
        created_at: {
          [Op.gte]: lastWeek
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        categoryStats,
        statusStats,
        avgRating: avgRating ? parseFloat(avgRating.getDataValue('average')).toFixed(1) : 0,
        recentFeedbacks
      }
    });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    next(error);
  }
};

// @desc    Get single feedback
// @route   GET /api/feedbacks/:id
// @access  Private (Admin only)
exports.getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role', 'email', 'first_name', 'last_name']
        },
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty'],
          required: false
        },
        {
          model: Competition,
          as: 'competition',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    next(error);
  }
};

// @desc    Update feedback status
// @route   PUT /api/feedbacks/:id/status
// @access  Private (Admin only)
exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }
    
    // Check if status is valid
    const validStatuses = ['unread', 'read', 'addressed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const feedback = await Feedback.findByPk(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    feedback.status = status;
    await feedback.save();
    
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    next(error);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedbacks/:id
// @access  Private (Admin only)
exports.deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    await feedback.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    next(error);
  }
};

// @desc    Create a new feedback
// @route   POST /api/feedbacks
// @access  Private
exports.createFeedback = async (req, res, next) => {
  try {
    const { content, rating, category, problem_id, competition_id, is_anonymous } = req.body;
    
    // Validate required fields
    if (!content || !rating || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content, rating, and category'
      });
    }
    
    // Create feedback
    const feedback = await Feedback.create({
      user_id: req.user.id,
      content,
      rating,
      category,
      problem_id: problem_id || null,
      competition_id: competition_id || null,
      is_anonymous: is_anonymous || false,
      status: 'unread'
    });
    
    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    next(error);
  }
};