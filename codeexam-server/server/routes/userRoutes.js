const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  toggleUserStatus
} = require('../controllers/userController');

// @route   GET /api/manage/users/stats
// @desc    Get user statistics summary
// @access  Private (Admin only)
router.get('/stats', protect(['admin']), getUserStats);

// @route   GET /api/manage/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin only)
router.get('/', protect(['admin']), getUsers);

// @route   POST /api/manage/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', protect(['admin']), createUser);

// @route   GET /api/manage/users/:id
// @desc    Get single user with detailed stats
// @access  Private (Admin only)
router.get('/:id', protect(['admin']), getUser);

// @route   PUT /api/manage/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/:id', protect(['admin']), updateUser);

// @route   DELETE /api/manage/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', protect(['admin']), deleteUser);

// @route   PUT /api/manage/users/:id/toggle-status
// @desc    Toggle user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/:id/toggle-status', protect(['admin']), toggleUserStatus);

module.exports = router;