const SubmissionDiscussion = require('../models/SubmissionDiscussion');
const DiscussionReply = require('../models/DiscussionReply');
const User = require('../models/User');
const Submission = require('../models/SubmissionDiscussion');

// @desc    Create a new discussion for a submission
// @route   POST /api/submissions/:submissionId/discussions
// @access  Private
exports.createDiscussion = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const submissionId = req.params.submissionId;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content'
      });
    }
    
    // Check if submission exists and is published
    const submission = await Submission.findByPk(submissionId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    if (!submission.is_published) {
      return res.status(403).json({
        success: false,
        message: 'This submission is not published for discussion'
      });
    }
    
    // Create discussion
    const discussion = await SubmissionDiscussion.create({
      title,
      content,
      submission_id: submissionId,
      user_id: req.user.id
    });
    
    // Get discussion with author info
    const discussionWithAuthor = await SubmissionDiscussion.findByPk(discussion.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      discussion: discussionWithAuthor
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    next(error);
  }
};

// @desc    Get all discussions for a submission
// @route   GET /api/submissions/:submissionId/discussions
// @access  Public (for published submissions)
exports.getDiscussions = async (req, res, next) => {
  try {
    const submissionId = req.params.submissionId;
    
    // Check if submission exists and is published
    const submission = await Submission.findByPk(submissionId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    if (!submission.is_published) {
      return res.status(403).json({
        success: false,
        message: 'This submission is not published for discussion'
      });
    }
    
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get discussions with count
    const { count, rows: discussions } = await SubmissionDiscussion.findAndCountAll({
      where: { submission_id: submissionId },
      limit,
      offset: startIndex,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    // Pagination result
    const pagination = {};
    
    if (startIndex + limit < count) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count,
      pagination,
      discussions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single discussion with replies
// @route   GET /api/discussions/:id
// @access  Public (for published submissions)
exports.getDiscussion = async (req, res, next) => {
  try {
    const discussion = await SubmissionDiscussion.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'role']
        },
        {
          model: Submission,
          as: 'submission',
          attributes: ['id', 'user_id', 'problem_id', 'is_published']
        }
      ]
    });
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if submission is published
    if (!discussion.submission.is_published) {
      return res.status(403).json({
        success: false,
        message: 'This submission is not published for discussion'
      });
    }
    
    // Get replies for this discussion
    const replies = await DiscussionReply.findAll({
      where: { discussion_id: discussion.id },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      discussion,
      replies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update discussion
// @route   PUT /api/discussions/:id
// @access  Private (Author only)
exports.updateDiscussion = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    if (!title && !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title or content to update'
      });
    }
    
    let discussion = await SubmissionDiscussion.findByPk(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if user is author or admin
    if (discussion.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this discussion'
      });
    }
    
    // Update discussion
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    
    await discussion.update(updateData);
    
    // Get updated discussion with author info
    discussion = await SubmissionDiscussion.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      discussion
    });
  } catch (error) {
    console.error('Update discussion error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    next(error);
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
// @access  Private (Author/Admin only)
exports.deleteDiscussion = async (req, res, next) => {
  try {
    const discussion = await SubmissionDiscussion.findByPk(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if user is author or admin
    if (discussion.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this discussion'
      });
    }
    
    await discussion.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new reply to a discussion
// @route   POST /api/discussions/:discussionId/replies
// @access  Private
exports.createReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    const discussionId = req.params.discussionId;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content for the reply'
      });
    }
    
    // Check if discussion exists
    const discussion = await SubmissionDiscussion.findByPk(discussionId, {
      include: [
        {
          model: Submission,
          as: 'submission',
          attributes: ['id', 'is_published']
        }
      ]
    });
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if submission is published
    if (!discussion.submission.is_published) {
      return res.status(403).json({
        success: false,
        message: 'Cannot reply to discussion for unpublished submission'
      });
    }
    
    // Create reply
    const reply = await DiscussionReply.create({
      content,
      discussion_id: discussionId,
      user_id: req.user.id
    });
    
    // Get reply with author info
    const replyWithAuthor = await DiscussionReply.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      reply: replyWithAuthor
    });
  } catch (error) {
    console.error('Create reply error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    next(error);
  }
};

// @desc    Update reply
// @route   PUT /api/replies/:id
// @access  Private (Author only)
exports.updateReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content to update'
      });
    }
    
    let reply = await DiscussionReply.findByPk(req.params.id);
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Check if user is author or admin
    if (reply.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reply'
      });
    }
    
    // Update reply
    await reply.update({ content });
    
    // Get updated reply with author info
    reply = await DiscussionReply.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('Update reply error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    next(error);
  }
};

// @desc    Delete reply
// @route   DELETE /api/replies/:id
// @access  Private (Author/Admin only)
exports.deleteReply = async (req, res, next) => {
  try {
    const reply = await DiscussionReply.findByPk(req.params.id);
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Check if user is author or admin
    if (reply.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply'
      });
    }
    
    await reply.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish/Unpublish a submission
// @route   PUT /api/submissions/:id/publish
// @access  Private (Owner/Admin/Judge only)
exports.togglePublishSubmission = async (req, res, next) => {
  try {
    const submissionId = req.params.id;
    const { is_published } = req.body;
    
    if (typeof is_published !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please provide is_published as a boolean value'
      });
    }
    
    const submission = await Submission.findByPk(submissionId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check if user is submission owner, admin, or judge
    if (
      submission.user_id !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'judge'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish/unpublish this submission'
      });
    }
    
    // Update publish status
    await submission.update({ is_published });
    
    res.status(200).json({
      success: true,
      message: is_published ? 'Submission published successfully' : 'Submission unpublished successfully',
      submission: {
        id: submission.id,
        is_published: submission.is_published
      }
    });
  } catch (error) {
    next(error);
  }
};