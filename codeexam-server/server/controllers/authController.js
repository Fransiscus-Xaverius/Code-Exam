const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check user status - prevent login for banned/inactive accounts
    if (user.status !== 'active') {
      let message = 'Account access denied';
      if (user.status === 'banned') {
        message = 'Account has been banned';
      } else if (user.status === 'inactive') {
        message = 'Account has been deactivated';
      }
      return res.status(403).json({ 
        success: false,
        message: message,
        accountStatus: user.status
      });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user without password
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      first_name: user.first_name,
      last_name: user.last_name,
      createdAt: user.createdAt,
      discuss: user.discuss
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    console.log(req.body);
    
    // Validate required fields
    if (!username || !email || !password) {
      console.log(username);
      console.log(email);
      console.log(password);
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Hash the password directly
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Create new user with hashed password
    const user = await User.create({
      username,
      email,
      password_hash, // Pass the hashed password directly
      role: 'competitor',
      first_name: first_name || null,
      last_name: last_name || null
    });
    
    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return user without password
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at
    };
    
    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Handle data truncation error
    if (error.name === 'SequelizeDatabaseError' &&
      error.parent &&
      (error.parent.code === 'WARN_DATA_TRUNCATED' ||
      error.parent.sqlMessage?.includes('Data truncated'))) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed: Invalid role value. Role must be one of: competitor, admin, or judge.'
      });
    }
    
    // Handle other Sequelize validation errors
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

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // User is already attached to request in auth middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};