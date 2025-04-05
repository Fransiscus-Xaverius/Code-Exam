const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  createFrontendProblem, 
  getFrontendProblem, 
  getFrontendProblems, 
  updateFrontendProblem, 
  deleteFrontendProblem
} = require('../controllers/frontendProblemController');

// @route POST /api/frontend-problems
// @desc Create new frontend problem
// @access Admin
router.post('/', protect(['admin']), createFrontendProblem);

// @route GET /api/frontend-problems
// @desc Get all frontend problems
// @access Protected
router.get('/', protect(), getFrontendProblems);

// @route GET /api/frontend-problems/:id
// @desc Get a specific frontend problem
// @access Protected
router.get('/:id', protect(), getFrontendProblem);

// @route PUT /api/frontend-problems/:id
// @desc Update a frontend problem
// @access Admin
router.put('/:id', protect(['admin']), updateFrontendProblem);

// @route DELETE /api/frontend-problems/:id
// @desc Delete a frontend problem
// @access Admin
router.delete('/:id', protect(['admin']), deleteFrontendProblem);

module.exports = router;