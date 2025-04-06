const FrontendSubmission = require('../models/FrontendSubmission');
const FrontendProblem = require('../models/FrontendProblem');
const User = require('../models/User');

// @desc    Submit a frontend solution
// @route   POST /api/frontend-submissions
// @access  Private
exports.createFrontendSubmission = async (req, res, next) => {
  try {
    const { problem_id, html_code, css_code, js_code, screenshot_url } = req.body;

    // Validate required fields
    if (!problem_id) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID is required'
      });
    }

    // Check if at least one code field is provided
    if (!html_code && !css_code && !js_code && !screenshot_url) {
      return res.status(400).json({
        success: false,
        message: 'At least one of HTML, CSS, JS code or screenshot URL must be provided'
      });
    }

    // Check if problem exists
    const problem = await FrontendProblem.findByPk(problem_id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Frontend problem not found'
      });
    }

    // Create submission
    const submission = await FrontendSubmission.create({
      user_id: req.user.id,
      problem_id,
      html_code: html_code || null,
      css_code: css_code || null,
      js_code: js_code || null,
      screenshot_url: screenshot_url || null,
      status: 'submitted'
    });

    res.status(201).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Create frontend submission error:', error);
    next(error);
  }
};

// @desc    Get all frontend submissions for a user
// @route   GET /api/frontend-submissions
// @access  Private
exports.getFrontendSubmissions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    
    // If not admin/judge, only show user's own submissions
    if (req.user.role !== 'admin' && req.user.role !== 'judge') {
      filter.user_id = req.user.id;
    } else if (req.query.user_id) {
      // Admin/judge can filter by user_id
      filter.user_id = req.query.user_id;
    }
    
    if (req.query.problem_id) {
      filter.problem_id = req.query.problem_id;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Get submissions with count
    const { count, rows: submissions } = await FrontendSubmission.findAndCountAll({
      where: filter,
      limit,
      offset: startIndex,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: FrontendProblem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty', 'points']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
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
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single frontend submission
// @route   GET /api/frontend-submissions/:id
// @access  Private
exports.getFrontendSubmission = async (req, res, next) => {
  try {
    const submission = await FrontendSubmission.findByPk(req.params.id, {
      include: [
        {
          model: FrontendProblem,
          as: 'problem'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        },
        {
          model: User,
          as: 'judge',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }
      ]
    });
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Frontend submission not found'
      });
    }
    
    // Check if user is authorized to view this submission
    if (req.user.role !== 'admin' && req.user.role !== 'judge' && submission.user_id !== req.user.id) {
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

// @desc    Grade a frontend submission
// @route   PUT /api/frontend-submissions/:id/grade
// @access  Private (Admin/Judge only)
exports.gradeFrontendSubmission = async (req, res, next) => {
  try {
    const { score, feedback } = req.body;
    
    if (score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Score is required'
      });
    }
    
    const submission = await FrontendSubmission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Frontend submission not found'
      });
    }
    
    // Update submission
    submission.score = score;
    submission.feedback = feedback || null;
    submission.status = 'graded';
    submission.judge_id = req.user.id;
    submission.judged_at = new Date();
    
    await submission.save();
    
    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a frontend submission
// @route   DELETE /api/frontend-submissions/:id
// @access  Private
exports.deleteFrontendSubmission = async (req, res, next) => {
  try {
    const submission = await FrontendSubmission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Frontend submission not found'
      });
    }
    
    // Check if user is authorized to delete this submission
    if (req.user.role !== 'admin' && submission.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this submission'
      });
    }
    
    await submission.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Frontend submission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};