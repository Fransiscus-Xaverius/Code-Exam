const express = require('express');
const router = express.Router();
const { adminOnly, protect } = require('../middleware/auth');
const { createProblem, getProblem, getProblems, updateProblem, deleteProblem} = require('../controllers/problemController')

// @route POST  /api/problems/new
// @desc Create new problem
// @access Admin
router.post('/', protect(['admin']), createProblem);

router.get('/', protect(), getProblems);

router.get('/:id', protect(), getProblem);

router.put('/:id', protect(['admin']), updateProblem);

router.delete('/:id', protect(['admin']), deleteProblem);

module.exports = router;