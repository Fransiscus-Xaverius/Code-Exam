const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

// @desc    Submit a solution to a problem
// @route   POST /api/submissions
// @access  Private
exports.createSubmission = async (req, res, next) => {
  try {
    const { problem_id, competition_id, code, language } = req.body;
    
    // Validate required fields
    if (!problem_id || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide problem_id, code, and language'
      });
    }
    
    // Check if problem exists
    const problem = await Problem.findByPk(problem_id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Create submission
    const submission = await Submission.create({
      user_id: req.user.id,
      problem_id,
      competition_id: competition_id || null,
      code,
      language,
      status: 'pending',
      submitted_at: new Date()
    });
    
    // TODO: Queue for judging (in a real application, you'd trigger the judge process)
    
    res.status(201).json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        submitted_at: submission.submitted_at
      }
    });
  } catch (error) {
    console.error('Create submission error:', error);
    
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

// @desc Get public published submissions
// @route GET /api/public/submissions
// @access Public (no authentication required)
exports.getPublicSubmissions = async (req, res, next) => {
    try {
      // Add pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;
      
      // Add filtering but only for published submissions
      const filter = {
        is_published: 1,
        // status: 'accepted' // Only show accepted submissions
      };
      
      // Additional filters
      if (req.query.problem_id) {
        filter.problem_id = req.query.problem_id;
      }
      
      if (req.query.language) {
        filter.language = req.query.language;
      }
      
      if (req.query.user_id) {
        filter.user_id = req.query.user_id;
      }
      
      // Get submissions with count
      const { count, rows: submissions } = await Submission.findAndCountAll({
        where: filter,
        limit,
        offset: startIndex,
        order: [['submitted_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          },
          {
            model: Problem,
            as: 'problem',
            attributes: ['id', 'title', 'difficulty']
          }
        ],
        attributes: { 
          exclude: ['error_message'] // Don't send error messages
        }
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
        submissions
      });
    } catch (error) {
      next(error);
    }
};
  
// @desc Get public submission details
// @route GET /api/public/submissions/:id
// @access Public (no authentication required)
exports.getPublicSubmission = async (req, res, next) => {
    try {
      const submission = await Submission.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          },
          {
            model: Problem,
            as: 'problem',
            attributes: ['id', 'title', 'difficulty', 'points']
          }
        ]
      });
      
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }
      
      // Check if submission is published
      if (!submission.is_published || submission.status !== 'accepted') {
        return res.status(403).json({
          success: false,
          message: 'This submission is not publicly available'
        });
      }
      
      // Return submission details
      res.status(200).json({
        success: true,
        submission: {
          id: submission.id,
          user: submission.user,
          problem: submission.problem,
          language: submission.language,
          code: submission.code, // Include the code for learning purposes
          score: submission.score,
          runtime_ms: submission.runtime_ms,
          memory_kb: submission.memory_kb,
          submitted_at: submission.submitted_at
        }
      });
    } catch (error) {
      next(error);
    }
};
  

// @desc Publish a submission (make it visible to others)
// @route PUT /api/submissions/:id/publish
// @access Private (Owner only)
exports.publishSubmission = async (req, res, next) => {
    try {
      const submission = await Submission.findByPk(req.params.id);
      
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }
      
      // Check authorization
      if (submission.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to publish this submission'
        });
      }
      
      // Only allow publishing of accepted submissions
      if (submission.status !== 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Only accepted submissions can be published'
        });
      }
      
      submission.is_published = true;
      await submission.save();
      
      res.status(200).json({
        success: true,
        message: 'Submission published',
        submission
      });
    } catch (error) {
      next(error);
    }
  };

// @desc    Get all submissions (with filtering)
// @route   GET /api/submissions
// @access  Private (Admin/Judge: all submissions, User: only their own)
exports.getSubmissions = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Add filtering
    const filter = {};
    
    // If user is not admin or judge, they can only see their own submissions
    if (req.user.role !== 'admin' && req.user.role !== 'judge') {
      filter.user_id = req.user.id;
    } else {
      // Admin/Judge can filter by user_id if provided
      if (req.query.user_id) {
        filter.user_id = req.query.user_id;
      }
    }
    
    // Additional filters
    if (req.query.problem_id) {
      filter.problem_id = req.query.problem_id;
    }
    
    if (req.query.competition_id) {
      filter.competition_id = req.query.competition_id;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.language) {
      filter.language = req.query.language;
    }
    
    // Get submissions with count
    const { count, rows: submissions } = await Submission.findAndCountAll({
      where: filter,
      limit,
      offset: startIndex,
      order: [['submitted_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty']
        },
        {
          model: User,
          as: 'judge',
          attributes: ['id', 'username'],
          required: false
        }
      ],
      attributes: { exclude: ['code'] } // Don't send code in the list view
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
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private (Owner/Admin/Judge)
exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty', 'points', 'time_limit_ms', 'memory_limit_kb']
        },
        {
          model: User,
          as: 'judge',
          attributes: ['id', 'username'],
          required: false
        }
      ]
    });
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check authorization
    if (
      submission.user_id !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'judge' &&
      !submission.is_published
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
    }
    
    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Judge a submission
// @route   PUT /api/submissions/:id/judge
// @access  Private (Admin/Judge only)
exports.judgeSubmission = async (req, res, next) => {
  try {
    const { 
      status, 
      execution_time_ms, 
      memory_used_kb, 
      score, 
      test_results, 
      judge_comment 
    } = req.body;
    
    // Validate status
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }
    
    // Check if status is valid
    const validStatuses = ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error', 'runtime_error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Find submission
    let submission = await Submission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'judge') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to judge submissions'
      });
    }
    
    // Update submission
    await submission.update({
      status,
      execution_time_ms: execution_time_ms || null,
      memory_used_kb: memory_used_kb || null,
      score: score || null,
      test_results: test_results || null,
      judge_comment: judge_comment || null,
      judge_id: req.user.id,
      judged_at: new Date()
    });
    
    // Get updated submission with associations
    submission = await Submission.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'judge',
          attributes: ['id', 'username']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Judge submission error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    next(error);
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Owner/Admin only)
exports.deleteSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check authorization
    if (submission.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this submission'
      });
    }
    
    await submission.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics (submission counts by status, etc.)
// @route   GET /api/submissions/stats
// @access  Private
exports.getSubmissionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get submission counts by status
    const statusCounts = await Submission.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { user_id: userId },
      group: ['status']
    });
    
    // Get submission counts by problem
    const problemCounts = await Submission.findAll({
      attributes: [
        'problem_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { user_id: userId },
      group: ['problem_id'],
      include: [
        {
          model: Problem,
          as: 'problem',
          attributes: ['title']
        }
      ]
    });
    
    // Get submission counts by language
    const languageCounts = await Submission.findAll({
      attributes: [
        'language',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { user_id: userId },
      group: ['language']
    });
    
    // Get recent submissions
    const recentSubmissions = await Submission.findAll({
      where: { user_id: userId },
      limit: 5,
      order: [['submitted_at', 'DESC']],
      include: [
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title']
        }
      ],
      attributes: ['id', 'status', 'score', 'submitted_at']
    });
    
    res.status(200).json({
      success: true,
      stats: {
        statusCounts,
        problemCounts,
        languageCounts,
        recentSubmissions
      }
    });
  } catch (error) {
    next(error);
  }
};