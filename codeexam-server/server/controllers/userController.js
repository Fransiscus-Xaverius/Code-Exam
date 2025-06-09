const User = require('../models/User');
const Submission = require('../models/Submission');
const CompetitionParticipant = require('../models/CompetitionParticipant');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// @desc    Get all users with pagination and filtering
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Add filtering
    const filter = {};
    
    // Search by username or email
    if (req.query.search) {
      filter[Op.or] = [
        { username: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
        { first_name: { [Op.like]: `%${req.query.search}%` } },
        { last_name: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    // Filter by role
    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Get users with count
    const { count, rows: users } = await User.findAndCountAll({
      where: filter,
      limit,
      offset: startIndex,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] } // Don't send password
    });
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userPlain = user.toJSON();
        
        // Get submission count
        const submissionCount = await Submission.count({
          where: { user_id: user.id }
        });
        
        // Get accepted submission count
        const acceptedCount = await Submission.count({
          where: { 
            user_id: user.id,
            status: 'accepted'
          }
        });
        
        // Get competition participation count
        const competitionCount = await CompetitionParticipant.count({
          where: { user_id: user.id }
        });
        
        return {
          ...userPlain,
          stats: {
            submissions: submissionCount,
            accepted: acceptedCount,
            competitions: competitionCount
          }
        };
      })
    );
    
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
      data: usersWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user with detailed stats
// @route   GET /api/users/:id
// @access  Private (Admin only)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get detailed stats
    const [
      submissionCount,
      acceptedCount,
      competitionCount,
      recentSubmissions
    ] = await Promise.all([
      Submission.count({ where: { user_id: user.id } }),
      Submission.count({ where: { user_id: user.id, status: 'accepted' } }),
      CompetitionParticipant.count({ where: { user_id: user.id } }),
      Submission.findAll({
        where: { user_id: user.id },
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'status', 'created_at'],
        include: [{
          model: require('../models/Problem'),
          as: 'problem',
          attributes: ['title']
        }]
      })
    ]);
    
    const userWithStats = {
      ...user.toJSON(),
      stats: {
        submissions: submissionCount,
        accepted: acceptedCount,
        competitions: competitionCount,
        successRate: submissionCount > 0 ? Math.round((acceptedCount / submissionCount) * 100) : 0
      },
      recentSubmissions
    };
    
    res.status(200).json({
      success: true,
      data: userWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      username,
      email,
      password_hash,
      first_name: first_name || null,
      last_name: last_name || null,
      role: role || 'competitor'
    });
    
    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password_hash;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    
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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { username, email, first_name, last_name, role, password } = req.body;
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (role) updateData.role = role;
    
    // Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }
    
    // Update user
    await user.update(updateData);
    
    // Get updated user without password
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    
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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Check if user has submissions
    const submissionCount = await Submission.count({
      where: { user_id: user.id }
    });
    
    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${submissionCount} submission(s). Consider deactivating instead.`
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics summary
// @route   GET /api/users/stats
// @access  Private (Admin only)
exports.getUserStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      judgeUsers,
      competitorUsers
    ] = await Promise.all([
      User.count(),
      User.count({
        where: {
          created_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      User.count({ where: { role: 'admin' } }),
      User.count({ where: { role: 'judge' } }),
      User.count({ where: { role: 'competitor' } })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        roles: {
          admin: adminUsers,
          judge: judgeUsers,
          competitor: competitorUsers
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (activate/deactivate)
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }
    
    // Toggle active status (you might need to add an 'active' field to User model)
    const newStatus = !user.active;
    await user.update({ active: newStatus });
    
    res.status(200).json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};