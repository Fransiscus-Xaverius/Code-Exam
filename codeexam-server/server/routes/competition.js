const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCompetition,
  getCompetitions,
  getCompetition,
  updateCompetition,
  deleteCompetition,
  joinCompetition,
  getCompetitionParticipants,
  checkRegistration,
  getCompetitionProblems,
  addProblemToCompetition,
  removeProblemFromCompetition,
  updateProblemOrder
} = require('../controllers/competitioncontroller');

// @route   POST /api/competitions
// @desc    Create a new competition
// @access  Private (Admin only)
router.post('/', protect(['admin']), createCompetition);

// @route   GET /api/competitions
// @desc    Get all competitions
// @access  Public (filtered based on user role)
router.get('/', getCompetitions);

// @route   GET /api/competitions/:id
// @desc    Get single competition
// @access  Public/Private (depends on competition visibility)
router.get('/:id', getCompetition);

// @route   PUT /api/competitions/:id
// @desc    Update competition
// @access  Private (Admin only)
router.put('/:id', protect(['admin']), updateCompetition);

// @route   DELETE /api/competitions/:id
// @desc    Delete competition
// @access  Private (Admin only)
router.delete('/:id', protect(['admin']), deleteCompetition);

// @route   POST /api/competitions/:id/join
// @desc    Join a competition
// @access  Private
router.post('/:id/join', protect(), joinCompetition);

// @route   GET /api/competitions/:id/participants
// @desc    Get participants of a competition
// @access  Private (Admin only)
router.get('/:id/participants', protect(['admin','judge']), getCompetitionParticipants);

// @route   GET /api/competitions/:id/registration
// @desc    Check if user is registered for a competition
// @access  Private
router.get('/:id/registration', protect(), checkRegistration);

// @route   GET /api/competitions/:id/problems
// @desc    Get problems for a competition
// @access  Public
router.get('/:id/problems', getCompetitionProblems);

// @route   POST /api/competitions/:id/problems
// @desc    Add a problem to a competition
// @access  Private (Admin only)
router.post('/:id/problems', protect(['admin']), addProblemToCompetition);

// @route   DELETE /api/competitions/:id/problems/:problemId
// @desc    Remove a problem from a competition
// @access  Private (Admin only)
router.delete('/:id/problems/:problemId', protect(['admin']), removeProblemFromCompetition);

// @route   PUT /api/competitions/:id/problems/:problemId
// @desc    Update problem order in a competition
// @access  Private (Admin only)
router.put('/:id/problems/:problemId', protect(['admin']), updateProblemOrder);

module.exports = router;