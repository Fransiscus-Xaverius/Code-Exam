const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getFeedbacks,
  getFeedbackStats,
  getFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  createFeedback
} = require('../controllers/feedbackController');

// @route   POST /api/feedbacks
// @desc    Create a new feedback
// @access  Private (Any authenticated user)
router.post('/', protect(), createFeedback);

// @route   GET /api/feedbacks
// @desc    Get all feedbacks
// @access  Private (Admin only)
router.get('/', protect(['admin']), getFeedbacks);

// @route   GET /api/feedbacks/stats
// @desc    Get feedback statistics
// @access  Private (Admin only)
router.get('/stats', protect(['admin']), getFeedbackStats);

// @route   GET /api/feedbacks/:id
// @desc    Get single feedback
// @access  Private (Admin only)
router.get('/:id', protect(['admin']), getFeedback);

// @route   PUT /api/feedbacks/:id/status
// @desc    Update feedback status
// @access  Private (Admin only)
router.put('/:id/status', protect(['admin']), updateFeedbackStatus);

// @route   DELETE /api/feedbacks/:id
// @desc    Delete feedback
// @access  Private (Admin only)
router.delete('/:id', protect(['admin']), deleteFeedback);

module.exports = router;