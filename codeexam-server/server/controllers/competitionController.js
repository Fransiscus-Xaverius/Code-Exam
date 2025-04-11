const Competition = require('../models/Competition');
const CompetitionParticipant = require('../models/CompetitionParticipant');
const User = require('../models/User');
const Problem = require('../models/Problem');
const CompetitionProblem = require('../models/CompetitionProblem');
const Submission = require('../models/Submission');
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
// @access  Private
exports.getCompetitionWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get competition details
    const competition = await Competition.findByPk(id);

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

    if (now < startTime) {
      return res.status(403).json({
        success: false,
        message: 'Competition has not started yet'
      });
    }

    if (now > endTime && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Competition has ended'
      });
    }

    // Check if user is registered for competition
    const participant = await CompetitionParticipant.findOne({
      where: { competition_id: id, user_id: userId }
    });

    if (!participant && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not registered for this competition'
      });
    }

    // Get competition problems - Remove problem_type from attributes
    const problems = await CompetitionProblem.findAll({
      where: { competition_id: id },
      include: [
        {
          model: Problem,
          attributes: ['id', 'title', 'description', 'difficulty', 'points']
        }
      ],
      order: [['order_index', 'ASC']]
    });

    // Get user's points for this competition
    const userPoints = await Submission.sum('score', {
      where: {
        user_id: userId,
        competition_id: id,
        status: 'accepted'
      }
    }) || 0;

    // Get total possible points
    const totalPoints = problems.reduce((total, problem) => {
      return total + (problem.Problem ? problem.Problem.points : 0);
    }, 0);

    // Get user's submission status for each problem
    const submissionStatuses = await exports.getUserSubmissionStatuses(userId, id);

    // Return workspace data
    res.json({
      success: true,
      data: {
        competition: {
          id: competition.id,
          name: competition.name,
          description: competition.description,
          start_time: competition.start_time,
          end_time: competition.end_time,
          leaderboard_visible: competition.leaderboard_visible
        },
        problems: problems.map(p => ({
          id: p.id,
          problem_id: p.problem_id,
          order_index: p.order_index,
          title: p.Problem ? p.Problem.title : null,
          difficulty: p.Problem ? p.Problem.difficulty : null,
          points: p.Problem ? p.Problem.points : null,
          status: submissionStatuses[p.problem_id] || null
        })),
        userProgress: {
          points: userPoints,
          totalPoints: totalPoints,
          problemsSolved: Object.values(submissionStatuses).filter(s => s === 'solved').length,
          totalProblems: problems.length
        }
      }
    });
  } catch (error) {
    console.error('Error getting competition workspace:', error);
    next(error);
  }
};

// Helper function to get user's submission statuses for competition problems
exports.getUserSubmissionStatuses = async (userId, competitionId) => {
  try {
    const submissions = await Submission.findAll({
      where: {
        user_id: userId,
        competition_id: competitionId
      },
      attributes: ['problem_id', 'status', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    // Group by problem_id and get latest submission status
    const statusMap = {};
    submissions.forEach(submission => {
      // Only update if not already set - this gives us the most recent submission
      if (!statusMap[submission.problem_id]) {
        statusMap[submission.problem_id] = submission.status === 'accepted' ? 'solved' : 'attempted';
      }
    });

    return statusMap;
  } catch (error) {
    console.error('Error getting submission statuses:', error);
    return {};
  }
};

// @desc    Get user's submission status for competition problems
// @route   GET /api/competitions/:id/submission-status
// @access  Private
exports.getSubmissionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const statusMap = await exports.getUserSubmissionStatuses(userId, id);
    
    res.json({
      success: true,
      data: statusMap
    });
  } catch (error) {
    console.error('Error getting submission statuses:', error);
    next(error);
  }
};

// @desc    Get competition leaderboard
// @route   GET /api/competitions/:id/leaderboard
// @access  Private
exports.getCompetitionLeaderboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check competition exists
    const competition = await Competition.findByPk(id);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    // Check if leaderboard should be visible
    if (!competition.leaderboard_visible && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Leaderboard is not visible for this competition'
      });
    }

    // Get participants with their total points - using score instead of points
    const leaderboard = await sequelize.query(`
      SELECT 
        cp.user_id,
        u.username,
        SUM(CASE WHEN s.status = 'accepted' THEN s.score ELSE 0 END) as total_points,
        COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) as problems_solved,
        MAX(s.created_at) as last_submission_time
      FROM 
        competition_participants cp
        LEFT JOIN users u ON cp.user_id = u.id
        LEFT JOIN submissions s ON cp.user_id = s.user_id AND s.competition_id = cp.competition_id
      WHERE 
        cp.competition_id = :competitionId
      GROUP BY 
        cp.user_id, u.username
      ORDER BY 
        total_points DESC,
        problems_solved DESC,
        last_submission_time ASC
    `, {
      replacements: { competitionId: id },
      type: sequelize.QueryTypes.SELECT
    });

    // Add rank and flag current user
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.user_id === userId
    }));

    res.json({
      success: true,
      data: rankedLeaderboard
    });
  } catch (error) {
    console.error('Error getting competition leaderboard:', error);
    next(error);
  }
};

// @desc    Get specific problem details in a competition
// @route   GET /api/competitions/:id/problems/:problemId/details
// @access  Private
exports.getCompetitionProblemDetails = async (req, res, next) => {
  try {
    const { id, problemId } = req.params;
    const userId = req.user.id;

    // Check if user is registered and competition is active
    const competitionAccessCheck = await checkCompetitionAccess(id, userId, req.user.isAdmin);
    if (!competitionAccessCheck.success) {
      return res.status(403).json(competitionAccessCheck);
    }

    // Get competition problem - Remove problem_type from attributes
    const competitionProblem = await CompetitionProblem.findOne({
      where: { 
        [Op.or]: [
          { id: problemId },
          { problem_id: problemId, competition_id: id }
        ]
      },
      include: {
        model: Problem,
        attributes: [
          'id', 'title', 'description', 'difficulty', 'points', 
          'input_format', 'output_format', 'constraints',
          'sample_input', 'sample_output', 'time_limit_ms',
          'memory_limit_kb', 'starter_code'
        ]
      }
    });

    if (!competitionProblem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found in this competition'
      });
    }

    // Get user's previous submissions for this problem
    const userSubmissions = await Submission.findAll({
      where: {
        user_id: userId,
        competition_id: id,
        problem_id: competitionProblem.problem_id
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        problem: competitionProblem.Problem,
        previousSubmissions: userSubmissions.map(s => ({
          id: s.id,
          status: s.status,
          language: s.language,
          code: s.code,
          points: s.points,
          created_at: s.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Error getting competition problem details:', error);
    next(error);
  }
};

// @desc    Submit solution for a competition problem
// @route   POST /api/competitions/:id/problems/:problemId/submit
// @access  Private
exports.submitCompetitionSolution = async (req, res, next) => {
  try {
    const { id, problemId } = req.params;
    const userId = req.user.id;
    const { code, language } = req.body;

    // Check competition access
    const accessCheck = await checkCompetitionAccess(id, userId, req.user.isAdmin);
    if (!accessCheck.success) {
      return res.status(403).json(accessCheck);
    }

    // Get problem details
    const competitionProblem = await CompetitionProblem.findOne({
      where: { 
        [Op.or]: [
          { id: problemId },
          { problem_id: problemId, competition_id: id }
        ]
      },
      include: {
        model: Problem,
        attributes: ['id', 'points', 'test_cases', 'hidden_test_cases']
      }
    });

    if (!competitionProblem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found in this competition'
      });
    }

    // Create submission - use score instead of points
    const submission = await Submission.create({
      user_id: userId,
      problem_id: competitionProblem.problem_id,
      competition_id: id,
      code,
      language,
      status: 'pending',
      score: 0
    });

    // Prepare test cases - prioritize hidden test cases for formal evaluation
    const testCases = competitionProblem.Problem.hidden_test_cases || competitionProblem.Problem.test_cases;
    
    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      await submission.update({ 
        status: 'error', 
        judge_comment: 'No test cases available for this problem'
      });
      
      return res.status(500).json({
        success: false,
        message: 'No test cases available for this problem'
      });
    }
    
    // Process submission for evaluation
    submitToJudge0(submission.id, code, language, testCases);

    res.json({
      success: true,
      data: {
        submission: {
          id: submission.id,
          status: submission.status,
          submitted_at: submission.submitted_at
        }
      }
    });
  } catch (error) {
    console.error('Error submitting competition solution:', error);
    next(error);
  }
};

// @desc    Run code for a competition problem
// @route   POST /api/competitions/:id/problems/:problemId/run
// @access  Private
exports.runCompetitionCode = async (req, res, next) => {
  try {
    const { id, problemId } = req.params;
    const userId = req.user.id;
    const { code, language, input } = req.body;

    // Check competition access
    const accessCheck = await checkCompetitionAccess(id, userId, req.user.isAdmin);
    if (!accessCheck.success) {
      return res.status(403).json(accessCheck);
    }

    // Get problem details - Remove problem_type from attributes
    const competitionProblem = await CompetitionProblem.findOne({
      where: { 
        [Op.or]: [
          { id: problemId },
          { problem_id: problemId, competition_id: id }
        ]
      },
      include: {
        model: Problem,
        attributes: ['id', 'sample_input']
      }
    });

    if (!competitionProblem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found in this competition'
      });
    }

    // Execute the code with Judge0
    try {
      const testInput = input || competitionProblem.Problem.sample_input;
      const result = await executeCode(code, language, testInput);
      
      res.json({
        success: true,
        data: {
          output: result.output,
          error: result.error,
          executionTime: result.executionTime
        }
      });
    } catch (execError) {
      console.error('Code execution error:', execError);
      res.status(500).json({
        success: false,
        message: 'Error executing code',
        error: execError.message
      });
    }
  } catch (error) {
    console.error('Error running code:', error);
    next(error);
  }
};

// Placeholder function for processing submissions - replace with actual Judge0 integration
async function processSubmission(code, language, testCases) {
  // This would be replaced with actual Judge0 API calls or similar service
  const results = [];

  for (const testCase of testCases) {
    try {
      const executionResult = await executeCode(code, language, testCase.input);
      const expectedOutput = testCase.output.trim();
      const actualOutput = executionResult.output.trim();
      const passed = actualOutput === expectedOutput;

      results.push({
        passed,
        input: testCase.input,
        expected: expectedOutput,
        actual: actualOutput,
        executionTime: executionResult.executionTime,
        error: executionResult.error
      });
    } catch (error) {
      results.push({
        passed: false,
        input: testCase.input,
        expected: testCase.output,
        actual: null,
        error: error.message
      });
    }
  }

  return results;
}

// Placeholder function for executing code - replace with actual Judge0 integration
async function executeCode(code, language, input) {
  // Mock implementation - replace with actual Judge0 API calls
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock result
      resolve({
        output: "Sample output",
        error: null,
        executionTime: 100
      });
    }, 500);
  });
}

// Helper function to check competition access
async function checkCompetitionAccess(competitionId, userId, isAdmin) {
  // Get competition details
  const competition = await Competition.findByPk(competitionId);

  if (!competition) {
    return {
      success: false,
      message: 'Competition not found'
    };
  }

  // Check if competition is active
  const now = new Date();
  const startTime = new Date(competition.start_time);
  const endTime = new Date(competition.end_time);

  if (now < startTime && !isAdmin) {
    return {
      success: false,
      message: 'Competition has not started yet'
    };
  }

  if (now > endTime && !isAdmin) {
    return {
      success: false,
      message: 'Competition has ended'
    };
  }

  // Check if user is registered for competition
  if (!isAdmin) {
    const participant = await CompetitionParticipant.findOne({
      where: { competition_id: competitionId, user_id: userId }
    });

    if (!participant) {
      return {
        success: false,
        message: 'You are not registered for this competition'
      };
    }
  }

  return { success: true, competition };
}

// @desc    Get user's submissions for a competition
// @route   GET /api/competitions/:id/submissions
// @access  Private
exports.getCompetitionSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify competition exists
    const competition = await Competition.findByPk(id);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    // Verify user is registered for competition if not admin
    if (!req.user.isAdmin && competition.registration_required) {
      const participant = await CompetitionParticipant.findOne({
        where: { competition_id: id, user_id: userId }
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: 'You are not registered for this competition'
        });
      }
    }

    // Get all submissions for this user in this competition
    const submissions = await Submission.findAll({
      where: {
        user_id: userId,
        competition_id: id
      },
      include: [
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty', 'points']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting competition submissions:', error);
    next(error);
  }
};