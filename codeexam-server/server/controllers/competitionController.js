const Competition = require('../models/Competition');
const CompetitionParticipant = require('../models/CompetitionParticipant');
const User = require('../models/User');
const Problem = require('../models/Problem');
const CompetitionProblem = require('../models/CompetitionProblem');
const Submission = require('../models/Submission');  // Add this import
const { Op } = require('sequelize');
const sequelize = require('../config/database');



// @desc    Create a new competition
// @route   POST /api/competitions
// @access  Private (Admin only)
exports.createCompetition = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      start_time, 
      end_time, 
      is_public, 
      registration_required, 
      leaderboard_visible 
    } = req.body;
    
    // Validate required fields
    if (!name || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validate dates
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for start_time or end_time'
      });
    }
    
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    
    // Create competition
    const competition = await Competition.create({
      name,
      description: description || null,
      start_time: startTime,
      end_time: endTime,
      is_public: is_public !== undefined ? is_public : true,
      registration_required: registration_required !== undefined ? registration_required : true,
      leaderboard_visible: leaderboard_visible !== undefined ? leaderboard_visible : true,
      created_by: req.user.id
    });
    
    res.status(201).json({
      success: true,
      competition
    });
  } catch (error) {
    console.error('Create competition error:', error);
    
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

// @desc    Get all competitions
// @route   GET /api/competitions
// @access  Public
exports.getCompetitions = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Add filtering
    const filter = {};
    
    // If not admin, only show public competitions
    if (!req.user || req.user.role !== 'admin') {
      filter.is_public = true;
    }
    
    // Get competitions with count
    const { count, rows: competitions } = await Competition.findAndCountAll({
      where: filter,
      limit,
      offset: startIndex,
      order: [['start_time', 'ASC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    // Pagination result
    const pagination = {};
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    // Add next page if not on last page
    if (page < totalPages) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    // Add previous page if not on first page
    if (page > 1) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count,
      pagination,
      data: competitions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single competition
// @route   GET /api/competitions/:id
// @access  Public/Private (depends on competition visibility)
exports.getCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }
    
    // Check if competition is public or user is admin
    if (!competition.is_public && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this competition'
      });
    }
    
    res.status(200).json({
      success: true,
      data: competition
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update competition
// @route   PUT /api/competitions/:id
// @access  Private (Admin only)
exports.updateCompetition = async (req, res, next) => {
  try {
    let competition = await Competition.findByPk(req.params.id);
    
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }
    
    const { 
      name, 
      description, 
      start_time, 
      end_time, 
      is_public, 
      registration_required, 
      leaderboard_visible 
    } = req.body;
    
    // Validate dates if provided
    if (start_time && end_time) {
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format for start_time or end_time'
        });
      }
      
      if (startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    } else if (start_time) {
      const startTime = new Date(start_time);
      const endTime = competition.end_time;
      
      if (isNaN(startTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format for start_time'
        });
      }
      
      if (startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    } else if (end_time) {
      const startTime = competition.start_time;
      const endTime = new Date(end_time);
      
      if (isNaN(endTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format for end_time'
        });
      }
      
      if (startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }
    
    // Update competition
    competition = await competition.update({
      name: name || competition.name,
      description: description !== undefined ? description : competition.description,
      start_time: start_time ? new Date(start_time) : competition.start_time,
      end_time: end_time ? new Date(end_time) : competition.end_time,
      is_public: is_public !== undefined ? is_public : competition.is_public,
      registration_required: registration_required !== undefined ? registration_required : competition.registration_required,
      leaderboard_visible: leaderboard_visible !== undefined ? leaderboard_visible : competition.leaderboard_visible
    });
    
    res.status(200).json({
      success: true,
      data: competition
    });
  } catch (error) {
    console.error('Update competition error:', error);
    
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

// @desc    Delete competition
// @route   DELETE /api/competitions/:id
// @access  Private (Admin only)
exports.deleteCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findByPk(req.params.id);
    
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }
    
    await competition.destroy();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a competition
// @route   POST /api/competitions/:id/join
// @access  Private
exports.joinCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findByPk(req.params.id);
    
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }
    
    // Check if registration is required
    if (!competition.registration_required) {
      return res.status(400).json({ 
        success: false, 
        message: 'This competition does not require registration' 
      });
    }

    // Check existing participation
    const existing = await CompetitionParticipant.findOne({
      where: {
        user_id: req.user.id,
        competition_id: competition.id
      }
    });

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: 'Already registered for this competition' 
      });
    }

    // Register user
    await CompetitionParticipant.create({
      user_id: req.user.id,
      competition_id: competition.id,
      registered_at: new Date()
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Join competition error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// @desc    Get participants of a competition
// @route   GET /api/competitions/:id/participants
// @access  Private (Admin only)
exports.getCompetitionParticipants = async (req, res, next) => {
  try {
    const competition = await Competition.findByPk(req.params.id);
    
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }
    
    // Get participants
    const participants = await CompetitionParticipant.findAll({
      where: {
        competition_id: competition.id
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: participants.length,
      data: participants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user is registered for a competition
// @route   GET /api/competitions/:id/registration
// @access  Private
exports.checkRegistration = async (req, res, next) => {
  try {
    const competition = await Competition.findByPk(req.params.id);
    
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }
    
    // Check if user is registered
    const registration = await CompetitionParticipant.findOne({
      where: {
        competition_id: competition.id,
        user_id: req.user.id
      }
    });
    
    res.status(200).json({
      success: true,
      isRegistered: !!registration,
      registrationData: registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get problems for a competition
// @route   GET /api/competitions/:id/problems
// @access  Public
exports.getCompetitionProblems = async (req, res, next) => {
  try {
    const competitionId = req.params.id;
    
    // Check if competition exists
    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }
    
    // Get problems for the competition with their details
    const problems = await CompetitionProblem.findAll({
      where: { competition_id: competitionId },
      include: [
        {
          model: Problem,
          attributes: ['id', 'title', 'description', 'difficulty', 'points', 'time_limit_ms', 'memory_limit_kb']
        }
      ],
      order: [['order_index', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error) {
    console.error('Get competition problems error:', error);
    next(error);
  }
};

// @desc    Add a problem to a competition
// @route   POST /api/competitions/:id/problems
// @access  Private (Admin only)
exports.addProblemToCompetition = async (req, res, next) => {
  try {
    const competitionId = req.params.id;
    const { problem_id, order_index } = req.body;
    
    // Validate required fields
    if (!problem_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide problem_id'
      });
    }
    
    // Check if competition exists
    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
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
    
    // Check if problem is already in the competition
    const existingProblem = await CompetitionProblem.findOne({
      where: {
        competition_id: competitionId,
        problem_id: problem_id
      }
    });
    
    if (existingProblem) {
      return res.status(400).json({
        success: false,
        message: 'Problem is already in the competition'
      });
    }
    
    // Get the highest order_index if not provided
    let orderIndex = order_index;
    if (orderIndex === undefined) {
      const maxOrderIndex = await CompetitionProblem.max('order_index', {
        where: { competition_id: competitionId }
      });
      orderIndex = (maxOrderIndex !== null ? maxOrderIndex : -1) + 1;
    }
    
    // Add problem to competition
    const competitionProblem = await CompetitionProblem.create({
      competition_id: competitionId,
      problem_id: problem_id,
      order_index: orderIndex
    });
    
    res.status(201).json({
      success: true,
      data: competitionProblem
    });
  } catch (error) {
    console.error('Add problem to competition error:', error);
    
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

// @desc    Remove a problem from a competition
// @route   DELETE /api/competitions/:id/problems/:problemId
// @access  Private (Admin only)
exports.removeProblemFromCompetition = async (req, res, next) => {
  try {
    const competitionId = req.params.id;
    const problemId = req.params.problemId;
    
    // Check if competition exists
    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }
    
    // Check if problem is in the competition
    const competitionProblem = await CompetitionProblem.findOne({
      where: {
        competition_id: competitionId,
        problem_id: problemId
      }
    });
    
    if (!competitionProblem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found in the competition'
      });
    }
    
    // Get the current order index before deleting
    const currentOrderIndex = competitionProblem.order_index;
    
    // Remove problem from competition
    await competitionProblem.destroy();
    
    // Update order indices for remaining problems
    await CompetitionProblem.update(
      { order_index: sequelize.literal('order_index - 1') },
      {
        where: {
          competition_id: competitionId,
          order_index: { [Op.gt]: currentOrderIndex }
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Problem removed from competition'
    });
  } catch (error) {
    console.error('Remove problem from competition error:', error);
    next(error);
  }
};

// @desc    Update problem order in a competition
// @route   PUT /api/competitions/:id/problems/:problemId
// @access  Private (Admin only)
exports.updateProblemOrder = async (req, res, next) => {
  try {
    const competitionId = req.params.id;
    const problemId = req.params.problemId;
    const { order_index } = req.body;
    
    // Validate required fields
    if (order_index === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order_index'
      });
    }
    
    // Check if competition exists
    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }
    
    // Check if problem is in the competition
    const competitionProblem = await CompetitionProblem.findOne({
      where: {
        competition_id: competitionId,
        problem_id: problemId
      }
    });
    
    if (!competitionProblem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found in the competition'
      });
    }
    
    // Get the current order index
    const currentOrderIndex = competitionProblem.order_index;
    
    // Update problem order
    if (currentOrderIndex < order_index) {
      // Moving down - decrease order_index for problems between current and new position
      await CompetitionProblem.update(
        { order_index: sequelize.literal('order_index - 1') },
        {
          where: {
            competition_id: competitionId,
            order_index: { [Op.gt]: currentOrderIndex, [Op.lte]: order_index }
          }
        }
      );
    } else if (currentOrderIndex > order_index) {
      // Moving up - increase order_index for problems between new and current position
      await CompetitionProblem.update(
        { order_index: sequelize.literal('order_index + 1') },
        {
          where: {
            competition_id: competitionId,
            order_index: { [Op.gte]: order_index, [Op.lt]: currentOrderIndex }
          }
        }
      );
    }
    
    // Update the problem's order_index
    competitionProblem.order_index = order_index;
    await competitionProblem.save();
    
    res.status(200).json({
      success: true,
      data: competitionProblem
    });
  } catch (error) {
    console.error('Update problem order error:', error);
    next(error);
  }
};

// @desc    Get competition workspace data
// @route   GET /api/competitions/:id/workspace
// @access  Private (Only registered participants, judges, and admins)
exports.getCompetitionWorkspace = async (req, res, next) => {
  try {
    const competitionId = req.params.id;
    const userId = req.user.id;

    // Check if competition exists
    const competition = await Competition.findByPk(competitionId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'role']
        }
      ]
    });

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    // Check if competition is active
    const now = new Date();
    const startTime = new Date(competition.start_time);
    const endTime = new Date(competition.end_time);
    const isActive = now >= startTime && now <= endTime;

    // If not active, only allow admins and judges to access
    if (!isActive && req.user.role !== 'admin' && req.user.role !== 'judge') {
      return res.status(403).json({
        success: false,
        message: 'This competition is not currently active'
      });
    }

    // If registration is required, check if user is registered
    if (competition.registration_required) {
      const isRegistered = await CompetitionParticipant.findOne({
        where: {
          competition_id: competitionId,
          user_id: userId
        }
      });

      // If not registered and not admin/judge, deny access
      if (!isRegistered && req.user.role !== 'admin' && req.user.role !== 'judge') {
        return res.status(403).json({
          success: false,
          message: 'You must be registered for this competition to access the workspace'
        });
      }
    }

    // Get competition problems
    const problems = await Problem.findAll({
      include: [
        {
          model: Competition,
          where: { id: competitionId },
          attributes: []
        }
      ],
      attributes: { exclude: ['hidden_test_cases'] }, // Don't send hidden test cases
      order: [
        [sequelize.literal('`CompetitionProblem`.`order_index`'), 'ASC']
      ]
    });

    // Get user's submissions for this competition if they exist
    const submissions = await Submission.findAll({
      where: {
        user_id: userId,
        competition_id: competitionId
      },
      include: [
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title']
        }
      ]
    });

    // Get participant stats if leaderboard is visible
    let participants = [];
    if (competition.leaderboard_visible || req.user.role === 'admin' || req.user.role === 'judge') {
      participants = await User.findAll({
        include: [
          {
            model: Competition,
            where: { id: competitionId },
            attributes: []
          }
        ],
        attributes: ['id', 'username'],
        through: { attributes: ['registered_at'] }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        competition,
        problems,
        submissions,
        participants,
        isActive
      }
    });
  } catch (error) {
    console.error('Get competition workspace error:', error);
    next(error);
  }
};

// @desc    Get user's submission status for competition problems
// @route   GET /api/competitions/:id/submission-status
// @access  Private
exports.getSubmissionStatus = async (req, res, next) => {
  try {
    const competitionId = req.params.id;
    const userId = req.user.id;

    // Check if competition exists
    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    // Get all problems for this competition
    const competitionProblems = await CompetitionProblem.findAll({
      where: { competition_id: competitionId },
      include: [{ model: Problem, attributes: ['id'] }]
    });

    // Get all problem IDs
    const problemIds = competitionProblems.map(cp => cp.problem_id);

    // Get user's submissions for these problems in this competition
    const submissions = await Submission.findAll({
      where: {
        user_id: userId,
        competition_id: competitionId,
        problem_id: { [Op.in]: problemIds }
      },
      attributes: ['problem_id', 'status', 'score']
    });

    // Create a map of problem_id to submission status
    const statusMap = {};
    
    // Initialize all problems as not attempted
    problemIds.forEach(id => {
      statusMap[id] = 'not_attempted';
    });

    // Update status based on submissions
    submissions.forEach(submission => {
      const problemId = submission.problem_id;
      
      // If any submission is successful, mark as solved
      if (submission.status === 'success' || submission.status === 'accepted') {
        statusMap[problemId] = 'solved';
      } 
      // Otherwise, if not already marked as solved, mark as attempted
      else if (statusMap[problemId] !== 'solved') {
        statusMap[problemId] = 'attempted';
      }
    });

    res.status(200).json({
      success: true,
      data: statusMap
    });
  } catch (error) {
    console.error('Get submission status error:', error);
    next(error);
  }
};