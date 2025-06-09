
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Check user status - prevent access for banned/inactive accounts
    if (user.status !== 'active') {
      let message = 'Access denied - account not active';
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

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// @desc    Admin only authentication middleware
// @usage   Use after the regular auth middleware
exports.adminOnly = async (req, res, next) => {
  try {
    let token;
    
    // Check if authorization header exists and starts with Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user with role
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      
      // Check user status - prevent access for banned/inactive accounts
      if (user.status !== 'active') {
        let message = 'Access denied - account not active';
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
      
      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized. Admin access required' });
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    next(error);
  }
};

exports.protect = (roles = []) => {
  return async (req, res, next) => {
    let token;
    
    // Check if authorization header exists and starts with Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user with role
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      
      // Check user status - prevent access for banned/inactive accounts
      if (user.status !== 'active') {
        let message = 'Access denied - account not active';
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
      
      // Check if user has required role (if roles specified)
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ 
          message: `Not authorized. Required role: ${roles.join(' or ')}`
        });
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  };
};