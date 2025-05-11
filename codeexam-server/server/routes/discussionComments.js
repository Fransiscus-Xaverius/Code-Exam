const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { check } = require('express-validator');
const discussionCommentsController = require('../controllers/discussionCommentsController');

// @route   GET /api/comments/discussion/:discussionId
// @desc    Get all comments for a specific discussion
// @access  Public
router.get(
  '/discussion/:discussionId',
  discussionCommentsController.getRepliesByDiscussion
);

// @route   POST /api/comments/discussion/:discussionId
// @desc    Create a new comment on a discussion
// @access  Private
router.post(
  '/discussion/:discussionId',
  protect(),
  [
    check('content', 'Comment content is required').not().isEmpty()
  ],
  discussionCommentsController.createReply
);

// @route   GET /api/comments/:replyId
// @desc    Get a specific comment by ID
// @access  Public
router.get(
  '/:replyId',
  discussionCommentsController.getReplyById
);

// @route   PUT /api/comments/:replyId
// @desc    Update a comment
// @access  Private (only comment author)
router.put(
  '/:replyId',
  protect(),
  [
    check('content', 'Comment content is required').not().isEmpty()
  ],
  discussionCommentsController.updateReply
);

// @route   DELETE /api/comments/:replyId
// @desc    Delete a comment
// @access  Private (comment author or admin)
router.delete(
  '/:replyId',
  protect(),
  discussionCommentsController.deleteReply
);

// @route   POST /api/comments/discussion/:discussionId/like
// @desc    Like a submission discussion
// @access  Private
router.post(
  '/discussion/:discussionId/like',
  protect(),
  discussionCommentsController.likeSubmission
);

module.exports = router;