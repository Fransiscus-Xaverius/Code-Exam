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
router.get('/', protect(), getSubmissions);

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

// @route   POST /api/submissions/:id/like
// @desc    Toggle like on a submission
// @access  Private
router.post('/:id/like', protect(), async (req, res, next) => {
  try {
    const submissionId = req.params.id;
    const userId = req.user.id;

    // Check if submission exists and is published
    const submission = await require('../controllers/submissionController').getSubmissionForLike(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (!submission.is_published) {
      return res.status(403).json({
        success: false,
        message: 'Cannot like unpublished submission'
      });
    }

    const SubmissionLike = require('../models/SubmissionLike');
    
    // Check if user already liked this submission
    const existingLike = await SubmissionLike.findOne({
      where: {
        submission_id: submissionId,
        user_id: userId
      }
    });

    if (existingLike) {
      // Unlike - remove the like
      await existingLike.destroy();
      
      // Get updated like count
      const likeCount = await SubmissionLike.count({
        where: { submission_id: submissionId }
      });

      return res.status(200).json({
        success: true,
        message: 'Submission unliked',
        isLiked: false,
        likeCount
      });
    } else {
      // Like - add the like
      await SubmissionLike.create({
        submission_id: submissionId,
        user_id: userId
      });

      // Get updated like count
      const likeCount = await SubmissionLike.count({
        where: { submission_id: submissionId }
      });

      return res.status(200).json({
        success: true,
        message: 'Submission liked',
        isLiked: true,
        likeCount
      });
    }
  } catch (error) {
    console.error('Toggle submission like error:', error);
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Like status conflict'
      });
    }
    
    next(error);
  }
});

module.exports = router;
