const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  createSubmission, 
  getSubmissions, 
  getSubmission, 
  judgeSubmission, 
  deleteSubmission, 
  getSubmissionStats,
  getPublicSubmission,
  getPublicSubmissions, 
} = require('../controllers/submissionController');

// @route GET /api/submissions/stats
// @desc Get submission statistics
// @access Protected
router.get('/stats', protect(), getSubmissionStats);

// @route POST /api/submissions
// @desc Create a new submission
// @access Protected
router.post('/', protect(), createSubmission);

// @route GET /api/submissions
// @desc Get all submissions
// @access Protected
router.get('/', protect(), getPublicSubmissions);

// @route GET /api/submissions/:id
// @desc Get a specific submission
// @access Protected
router.get('/:id', protect(), getPublicSubmission);

// @route DELETE /api/submissions/:id
// @desc Delete a submission
// @access Protected
router.delete('/:id', protect(), deleteSubmission);

// @route PUT /api/submissions/:id/judge
// @desc Judge a submission
// @access Admin & Judge
router.put('/:id/judge', protect(['admin', 'judge']), judgeSubmission);

module.exports = router;
