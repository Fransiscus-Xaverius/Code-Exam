const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getSubmission, 
  getSubmissions, 
  judgeSubmission: reviewSubmission,
  getPublicSubmissions,
  getCompetitionSubmission,
  getSubmissionStats,
  createSubmission,
  publishSubmission,
  judgeSubmission,
  deleteSubmission,
  getPublicSubmission,
  submit
} = require('../controllers/submissionController');

// @route GET /api/submissions/stats
// @desc Get submission statistics
// @access Protected
router.get('/stats', protect(), getSubmissionStats);

// @route POST /api/submissions/run-code
// @desc Run code without formal submission
// @access Protected
router.post('/run-code', protect(), createSubmission);

// @route POST /api/submissions/submit
// @desc Create a full submission
// @access Protected
router.post('/submit', protect(), submit);

// @route GET /api/public/submissions
// @desc Get all submissions
// @access Protected
router.get('/public', protect(), getPublicSubmissions);

// @route GET /api/submissions/:id
// @desc Get a specific submission
// @access Protected
router.get('/:id', protect(), getSubmission);

// @route GET /api/public/submissions/:id
// @desc Get a specific submission
// @access Protected
router.get('/public/:id', protect(), getPublicSubmission);

// @route DELETE /api/submissions/:id
// @desc Delete a submission
// @access Protected
router.delete('/:id', protect(), deleteSubmission);

// @route PUT /api/submissions/:id/judge
// @desc Judge a submission
// @access Admin & Judge
router.put('/:id/judge', protect(['admin', 'judge']), judgeSubmission);

router.put('/:id/publish', protect(), publishSubmission);

// @access  Public
// @route   GET /api/submissionsubmissions);
// @desc    Get all submissions
// @access  Private (Admin/Judge only)
router.get('/', protect(['admin', 'judge']), getSubmissions);

// @access  Private (Admin/Judge only)
// @route   GET /api/submissions/public
// @desc    Get public submissions (for forum)
// @access  Public
router.get('/public', getPublicSubmissions);

// @route   PUT /api/submissions/:id/review
// @desc    Review a submission (Judge only)
// @access  Private (Admin/Judge only)
router.put('/:id/review', protect(['admin', 'judge']), reviewSubmission);

// @route   GET /api/competitions/:competitionId/submissions/:id
// @desc    Get competition submission
// @access  Private
router.get('/competitions/:competitionId/submissions/:id', protect(), getCompetitionSubmission);

module.exports = router;
