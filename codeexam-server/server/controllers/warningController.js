const User = require('../models/User');
const Warning = require('../models/Warning');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer'); // You'll need to install and configure this

// Email configuration (configure according to your email service)
const transporter = nodemailer.createTransport({
  // Configure your email service here
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @desc    Warn user and send email
// @route   POST /api/users/:id/warn
// @access  Private (Admin only)
exports.warnUser = async (req, res, next) => {
  try {
    const { reason, sendEmail = true } = req.body;
    const userId = req.params.id;
    const adminId = req.user.id;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Warning reason is required'
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent warning yourself
    if (userId == adminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot warn yourself'
      });
    }

    // Create warning record
    const warning = await Warning.create({
      user_id: userId,
      admin_id: adminId,
      reason: reason.trim()
    });

    // Get admin info for email
    const admin = await User.findByPk(adminId);

    console.log(process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_USER, process.env.EMAIL_PASS);

    // Send warning email if requested
    if (sendEmail) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@codeexam.com',
          to: user.email,
          subject: 'Warning Notice - CodeExam Platform',
          html: `
            <h2>Warning Notice</h2>
            <p>Dear ${user.username},</p>
            <p>You have received a warning from the CodeExam administration team.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3>Warning Details:</h3>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Issued By:</strong> ${admin.username}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Please review our platform guidelines and ensure future compliance.</p>
            <p>If you have any questions or believe this warning was issued in error, please contact our support team.</p>
            <br>
            <p>Best regards,<br>CodeExam Administration Team</p>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Failed to send warning email:', emailError);
        // Don't fail the warning creation if email fails
      }
    }

    // Get warning count for this user
    const warningCount = await Warning.count({
      where: { user_id: userId }
    });

    // Get the warning with populated relationships
    const warningWithDetails = await Warning.findByPk(warning.id, {
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        { 
          model: User, 
          as: 'admin',
          attributes: ['id', 'username']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: `Warning issued successfully. User has ${warningCount} warning(s).`,
      data: {
        warning: warningWithDetails,
        warningCount,
        emailSent: sendEmail
      }
    });
  } catch (error) {
    console.error('Warn user error:', error);
    next(error);
  }
};

// @desc    Get user warnings
// @route   GET /api/users/:id/warnings
// @access  Private (Admin only)
exports.getUserWarnings = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: warnings } = await Warning.findAndCountAll({
      where: { user_id: userId },
      include: [
        { 
          model: User, 
          as: 'admin',
          attributes: ['id', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      data: warnings,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (activate/deactivate/ban)
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const userId = req.params.id;
    const adminId = req.user.id;

    if (!status || !['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active, inactive, or banned'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing your own status
    if (userId == adminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }

    const oldStatus = user.status;
    
    // Update user status
    await user.update({ status });

    // If banning or deactivating, create a warning record for audit
    if (status !== 'active' && reason) {
      await Warning.create({
        user_id: userId,
        admin_id: adminId,
        reason: `Status changed from ${oldStatus} to ${status}. Reason: ${reason}`
      });
    }

    // Send notification email
    try {
      let emailSubject, emailContent;
      
      switch (status) {
        case 'active':
          emailSubject = 'Account Activated - CodeExam Platform';
          emailContent = `
            <h2>Account Activated</h2>
            <p>Dear ${user.username},</p>
            <p>Your CodeExam account has been activated and you can now access all platform features.</p>
            ${reason ? `<p><strong>Note:</strong> ${reason}</p>` : ''}
            <p>Welcome back!</p>
          `;
          break;
        case 'inactive':
          emailSubject = 'Account Deactivated - CodeExam Platform';
          emailContent = `
            <h2>Account Deactivated</h2>
            <p>Dear ${user.username},</p>
            <p>Your CodeExam account has been temporarily deactivated.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>Please contact support if you have any questions.</p>
          `;
          break;
        case 'banned':
          emailSubject = 'Account Banned - CodeExam Platform';
          emailContent = `
            <h2>Account Banned</h2>
            <p>Dear ${user.username},</p>
            <p>Your CodeExam account has been banned due to policy violations.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you believe this was done in error, please contact support.</p>
          `;
          break;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@codeexam.com',
        to: user.email,
        subject: emailSubject,
        html: `
          ${emailContent}
          <br>
          <p>Best regards,<br>CodeExam Administration Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send status change email:', emailError);
    }

    // Get updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    // Get warning count
    const warningCount = await Warning.count({
      where: { user_id: userId }
    });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: {
        user: updatedUser,
        warningCount,
        oldStatus,
        newStatus: status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    next(error);
  }
};

// @desc    Get all warnings (admin overview)
// @route   GET /api/warnings
// @access  Private (Admin only)
exports.getAllWarnings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Filter options
    const filter = {};
    if (req.query.user_id) filter.user_id = req.query.user_id;
    if (req.query.admin_id) filter.admin_id = req.query.admin_id;

    const { count, rows: warnings } = await Warning.findAndCountAll({
      where: filter,
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        { 
          model: User, 
          as: 'admin',
          attributes: ['id', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      data: warnings,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete warning (admin cleanup)
// @route   DELETE /api/warnings/:id
// @access  Private (Admin only)
exports.deleteWarning = async (req, res, next) => {
  try {
    const warning = await Warning.findByPk(req.params.id);
    
    if (!warning) {
      return res.status(404).json({
        success: false,
        message: 'Warning not found'
      });
    }

    await warning.destroy();

    res.status(200).json({
      success: true,
      message: 'Warning deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};