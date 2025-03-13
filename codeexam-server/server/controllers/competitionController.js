const Competition = require('../models/Competition');
const CompetitionParticipant = require('../models/CompetitionParticipant');
const User = require('../models/User');
const { Op } = require('sequelize');



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