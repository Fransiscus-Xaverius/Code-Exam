const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  createDiscussion, 
  getDiscussions, 
  getDiscussion, 
  updateDiscussion, 
  deleteDiscussion, 
  createReply, 
  updateReply, 
  deleteReply, 
  togglePublishSubmission 
} = require('../controllers/discussionController');

// @route PUT /api/submissions/:id/publish
// @desc Toggle publish status of a submission
// @access Protected
router.put('/submissions/:id/publish', protect(), togglePublishSubmission);

// @route POST /api/submissions/:submissionId/discussions
// @desc Create a discussion for a submission
// @access Protected
router.post('/submissions/:submissionId/discussions', protect(), createDiscussion);

// @route GET /api/submissions/:submissionId/discussions
// @desc Get all discussions for a submission
// @access Public
router.get('/submissions/:submissionId/discussions', getDiscussions);

// @route GET /api/discussions/:id
// @desc Get a single discussion
// @access Public
router.get('/discussions/:id', getDiscussion);

// @route PUT /api/discussions/:id
// @desc Update a discussion
// @access Protected
router.put('/discussions/:id', protect(), updateDiscussion);

// @route DELETE /api/discussions/:id
// @desc Delete a discussion
// @access Protected
router.delete('/discussions/:id', protect(), deleteDiscussion);

// @route POST /api/discussions/:discussionId/replies
// @desc Create a reply to a discussion
// @access Protected
router.post('/discussions/:discussionId/replies', protect(), createReply);

// @route PUT /api/replies/:id
// @desc Update a reply
// @access Protected
router.put('/replies/:id', protect(), updateReply);

// @route DELETE /api/replies/:id
// @desc Delete a reply
// @access Protected
router.delete('/replies/:id', protect(), deleteReply);

module.exports = router;
