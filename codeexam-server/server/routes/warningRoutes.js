const express = require('express');
const {
  warnUser,
  getUserWarnings,
  updateUserStatus,
  getAllWarnings,
  deleteWarning
} = require('../controllers/warningController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Warn a specific user
// @route   POST /api/manage/users/:id/warn
// @access  Private (Admin only)
router.post('/users/:id/warn', protect(['admin']), warnUser);

// @desc    Get warnings for a specific user
// @route   GET /api/manage/users/:id/warnings
// @access  Private (Admin only)
router.get('/users/:id/warnings', protect(['admin']), getUserWarnings);

// @desc    Update user status (activate/deactivate/ban)
// @route   PUT /api/manage/users/:id/status
// @access  Private (Admin only)
router.put('/users/:id/status', protect(['admin']), updateUserStatus);

// @desc    Get all warnings (admin overview)
// @route   GET /api/manage/warnings
// @access  Private (Admin only)
router.get('/warnings', protect(['admin']), getAllWarnings);

// @desc    Delete a warning
// @route   DELETE /api/manage/warnings/:id
// @access  Private (Admin only)
router.delete('/warnings/:id', protect(['admin']), deleteWarning);

module.exports = router;