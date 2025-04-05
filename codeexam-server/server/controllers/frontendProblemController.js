const FrontendProblem = require('../models/FrontendProblem');
const User = require('../models/User');

// @desc    Create a new frontend problem
// @route   POST /api/frontend-problems
// @access  Private (Admin/Judge only)
exports.createFrontendProblem = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      difficulty, 
      points, 
      requirements,
      starter_code,
      expected_output_image,
      solution_code,
      evaluation_criteria,
      time_limit_minutes,
      tags,
      resources
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !difficulty || !points) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be one of: Easy, Medium, Hard'
      });
    }
    
    // Create frontend problem
    const frontendProblem = await FrontendProblem.create({
      title,
      description,
      difficulty,
      points,
      requirements: requirements || null,
      starter_code: starter_code || null,
      expected_output_image: expected_output_image || null,
      solution_code: solution_code || null,
      evaluation_criteria: evaluation_criteria || null,
      time_limit_minutes: time_limit_minutes || 60,
      tags: tags || null,
      resources: resources || null,
      created_by: req.user.id
    });
    
    res.status(201).json({
      success: true,
      problem: frontendProblem
    });
  } catch (error) {
    console.error('Create frontend problem error:', error);
    
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

// @desc    Get all frontend problems
// @route   GET /api/frontend-problems
// @access  Public
exports.getFrontendProblems = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Add filtering
    const filter = {};
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    
    // Get frontend problems with count
    const { count, rows: problems } = await FrontendProblem.findAndCountAll({
      where: filter,
      limit,
      offset: startIndex,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['solution_code'] } // Don't send solution code
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
      problems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single frontend problem
// @route   GET /api/frontend-problems/:id
// @access  Public
exports.getFrontendProblem = async (req, res, next) => {
  try {
    const problem = await FrontendProblem.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }
      ],
      attributes: { exclude: ['solution_code'] } // Don't send solution code to regular users
    });
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Frontend problem not found'
      });
    }
    
    // If user is admin or judge, include solution code
    if (req.user && (req.user.role === 'admin' || req.user.role === 'judge')) {
      const fullProblem = await FrontendProblem.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'first_name', 'last_name']
          }
        ]
      });
      
      return res.status(200).json({
        success: true,
        problem: fullProblem
      });
    }
    
    res.status(200).json({
      success: true,
      problem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a frontend problem
// @route   PUT /api/frontend-problems/:id
// @access  Private (Admin/Judge only)
exports.updateFrontendProblem = async (req, res, next) => {
  try {
    let problem = await FrontendProblem.findByPk(req.params.id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Frontend problem not found'
      });
    }
    
    // Update problem
    problem = await problem.update(req.body);
    
    res.status(200).json({
      success: true,
      problem
    });
  } catch (error) {
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

// @desc    Delete a frontend problem
// @route   DELETE /api/frontend-problems/:id
// @access  Private (Admin only)
exports.deleteFrontendProblem = async (req, res, next) => {
  try {
    const problem = await FrontendProblem.findByPk(req.params.id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Frontend problem not found'
      });
    }
    
    await problem.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Frontend problem deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};