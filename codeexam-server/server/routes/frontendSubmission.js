const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  createFrontendSubmission, 
  getFrontendSubmission, 
  getFrontendSubmissions, 
  gradeFrontendSubmission, 
  deleteFrontendSubmission 
} = require('../controllers/frontendSubmissionController');

// @route POST /api/frontend-submissions
// @desc Submit a frontend solution
// @access Protected
router.post('/', protect(), createFrontendSubmission);

// @route GET /api/frontend-submissions
// @desc Get all frontend submissions (filtered by user for regular users)
// @access Protected
router.get('/', protect(), getFrontendSubmissions);

// @route GET /api/frontend-submissions/:id
// @desc Get a specific frontend submission
// @access Protected
router.get('/:id', protect(), getFrontendSubmission);

// @route PUT /api/frontend-submissions/:id/grade
// @desc Grade a frontend submission
// @access Admin & Judge
router.put('/:id/grade', protect(['admin', 'judge']), gradeFrontendSubmission);

// @route DELETE /api/frontend-submissions/:id
// @desc Delete a frontend submission
// @access Protected (own submissions or admin)
router.delete('/:id', protect(), deleteFrontendSubmission);

module.exports = router;