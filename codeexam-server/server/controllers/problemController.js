const Problem = require('../models/Problem');
const User = require('../models/User');

// @desc    Create a new problem
// @route   POST /api/problems
// @access  Private (Admin/Judge only)
exports.createProblem = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      difficulty, 
      points, 
      time_limit_ms, 
      memory_limit_kb,
      input_format,
      output_format,
      constraints,
      sample_input,
      sample_output,
      hidden_test_cases
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !difficulty || !points || !time_limit_ms || !memory_limit_kb) {
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
    
    // Create problem
    const problem = await Problem.create({
      title,
      description,
      difficulty,
      points,
      time_limit_ms,
      memory_limit_kb,
      input_format: input_format || null,
      output_format: output_format || null,
      constraints: constraints || null,
      sample_input: sample_input || null,
      sample_output: sample_output || null,
      hidden_test_cases: hidden_test_cases || null,
      created_by: req.user.id
    });
    
    res.status(201).json({
      success: true,
      problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    
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

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
exports.getProblems = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Add filtering
    const filter = {
      deleted_at: null // Only get non-deleted problems
    };
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    
    // Get problems with count
    const { count, rows: problems } = await Problem.findAndCountAll({
      where: filter,
      limit,
      offset: startIndex,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['hidden_test_cases'] } // Don't send hidden test cases
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

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
exports.getProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'role']
        }
      ],
      attributes: { exclude: ['hidden_test_cases'] } // Don't send hidden test cases to regular users
    });
    
    if (!problem || problem.deleted_at) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // If user is admin or judge, include hidden test cases
    if (req.user && (req.user.role === 'admin' || req.user.role === 'judge')) {
      const fullProblem = await Problem.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'role']
          }
        ]
      });
      
      if (!fullProblem || fullProblem.deleted_at) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }
      
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

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private (Admin/Judge only)
exports.updateProblem = async (req, res, next) => {
  try {
    let problem = await Problem.findByPk(req.params.id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Check if user is creator, admin, or judge
    if (
      problem.created_by !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'judge'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this problem'
      });
    }
    
    // Validate difficulty if provided
    if (req.body.difficulty) {
      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      if (!validDifficulties.includes(req.body.difficulty)) {
        return res.status(400).json({
          success: false,
          message: 'Difficulty must be one of: Easy, Medium, Hard'
        });
      }
    }
    
    // Update problem
    await problem.update(req.body);
    
    // Get updated problem with creator info
    problem = await Problem.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      problem
    });
  } catch (error) {
    console.error('Update problem error:', error);
    
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

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private (Admin/Judge only)
exports.deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Check if problem is already deleted
    if (problem.deleted_at) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Check if user is creator, admin, or judge
    if (
      problem.created_by !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'judge'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this problem'
      });
    }
    
    // Soft delete - set deleted_at timestamp
    await problem.update({ deleted_at: new Date() });
    
    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};