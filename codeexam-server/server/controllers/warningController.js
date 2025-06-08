const User = require('../models/User');
const Warning = require('../models/Warning');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer'); // You'll need to install and configure this

// Email configuration (configure according to your email service)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,        // mail.smtp2go.com
  port: process.env.EMAIL_PORT,        // 2525 (recommended) or 587
  secure: false,                       // false for 2525/587, true for 465
  auth: {
    user: process.env.EMAIL_USER,      // Your SMTP2GO username
    pass: process.env.EMAIL_PASS       // Your SMTP2GO password
  },
  tls: {
    rejectUnauthorized: false
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

    console.log('email config:', process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_USER, process.env.EMAIL_PASS);

    // Send warning email if requested
if (sendEmail) {
  try {
    // Validate user email exists
    if (!user.email || !user.email.trim()) {
      console.warn(`Warning created but no email sent - User ${userId} has no email address`);
    } else {
      // Escape HTML content to prevent XSS
      const escapeHtml = (text) => {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@codeexam.com',
        to: user.email.trim(),
        subject: 'Warning Notice - CodeExam Platform',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Warning Notice</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc3545; margin-top: 0;">⚠️ Warning Notice</h2>
            <p>Dear <strong>${escapeHtml(user.username)}</strong>,</p>
            <p>You have received a warning from the CodeExam administration team.</p>
            
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #856404; margin-top: 0;">Warning Details:</h3>
              <p><strong>Reason:</strong> ${escapeHtml(reason.trim())}</p>
              <p><strong>Issued By:</strong> ${escapeHtml(admin.username)}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            
            <p>Please review our platform guidelines and ensure future compliance to avoid further action.</p>
            <p>If you have any questions or believe this warning was issued in error, please contact our support team.</p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="margin-bottom: 0;">
              Best regards,<br>
              <strong>CodeExam Administration Team</strong>
            </p>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 4px; font-size: 12px; color: #6c757d;">
              <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
              <p style="margin: 5px 0 0 0;">For support inquiries, please contact: support@codeexam.com</p>
            </div>
          </div>
        </body>
        </html>
        `,
        // Also include a plain text version for better compatibility
        text: `
Warning Notice - CodeExam Platform

Dear ${user.username},

You have received a warning from the CodeExam administration team.

Warning Details:
- Reason: ${reason.trim()}
- Issued By: ${admin.username}
- Date: ${new Date().toLocaleDateString()}

Please review our platform guidelines and ensure future compliance.

If you have any questions or believe this warning was issued in error, please contact our support team.

Best regards,
CodeExam Administration Team

This is an automated message. Please do not reply to this email.
        `.trim()
      };

      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Warning email sent successfully to ${user.email}`, {
        messageId: info.messageId,
        userId: userId,
        warningId: warning.id
      });
    }
  } catch (emailError) {
    console.error('❌ Failed to send warning email:', {
      error: emailError.message,
      userId: userId,
      userEmail: user.email,
      warningId: warning.id,
      stack: emailError.stack
    });
    
    // Optionally, you could store failed email attempts in the database
    // await Warning.update(
    //   { emailSent: false, emailError: emailError.message },
    //   { where: { id: warning.id } }
    // );
    
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