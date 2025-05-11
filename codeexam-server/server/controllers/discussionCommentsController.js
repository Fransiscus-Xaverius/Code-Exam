/**
 * MODEL CLASS NAME IS DISCUSSION_REPLY BUT SHOULD'VE BEEN DISCUSSION_COMMENTS
 * TODO:
 * - Rename the model class to DiscussionComments instead of DiscussionReply
 * fx
 */
const DiscussionReply = require('../models/DiscussionReply');
const SubmissionDiscussion = require('../models/SubmissionDiscussion');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class DiscussionCommentsController {
  // Get all replies for a specific discussion
  async getRepliesByDiscussion(req, res) {
    try {
      const discussionId = req.params.discussionId;
      // Verify discussion exists
      const discussion = await SubmissionDiscussion.findOne({
        where: { submission_id: discussionId }
      });
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }
      
      const replies = await DiscussionReply.findAll({
        where: { discussion_id: discussion.id },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ],
        order: [['created_at', 'ASC']]
      });
      
      const formattedComments = replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        username: reply.author.username,
        timestamp: reply.created_at,
        likes: reply.likes || 0,
        user_id: reply.user_id
      }));
      
      res.status(200).json({ 
        success: true,
        comments: formattedComments
      });
    } catch (error) {
      console.error('Error getting discussion replies:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve discussion replies',
        error: error.message 
      });
    }
  }

  async createReply(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }
      
      const { content } = req.body;
      const discussionId = req.params.discussionId;
      const userId = req.user.id; // Assuming user ID is added by auth middleware
      console.log('TES', discussionId)
      const discussion = await SubmissionDiscussion.findOne({
        where: { submission_id: discussionId }
      });
      if (!discussion) {
        return res.status(404).json({ 
          success: false,
          message: 'Discussion not found' 
        });
      }
      
      const newReply = await DiscussionReply.create({
        discussion_id: discussion.id,
        user_id: userId,
        content,
        likes: 0
      });
      
      const reply = await DiscussionReply.findByPk(newReply.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ]
      });
      
      const comment = {
        id: reply.id,
        content: reply.content,
        username: reply.author.username,
        timestamp: reply.created_at,
        likes: 0,
        user_id: reply.user_id
      };
      
      res.status(201).json({ 
        success: true,
        message: 'Reply created successfully',
        comment: comment
      });

      await SubmissionDiscussion.update(
        { comment_count: discussion.comment_count + 1 },
        { where: { id: discussionId } }
      );
    } catch (error) {
      console.error('Error creating discussion reply:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to create reply',
        error: error.message 
      });
    }
  }

  // Add a like submission API method
  async likeSubmission(req, res) {
    try {
      const discussionId = req.params.discussionId;
      const userId = req.user.id; // Assuming user ID is added by auth middleware
      
      // Verify discussion exists
      const discussion = await SubmissionDiscussion.findOne({
        where: { submission_id: discussionId }
      });
      if (!discussion) {
        return res.status(404).json({ 
          success: false,
          message: 'Discussion not found' 
        });
      }
      
      // Check if user already liked this submission
      // This would require a new model/table for tracking likes
      // For now, we'll just increment the like count
      
      // Update like count in the discussion
      await SubmissionDiscussion.increment('likes', { 
        by: 1,
        where: { id: discussionId } 
      });
      
      res.status(200).json({ 
        success: true,
        message: 'Submission liked successfully'
      });
    } catch (error) {
      console.error('Error liking submission:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to like submission',
        error: error.message 
      });
    }
  }

  // Update a reply
  async updateReply(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }
      
      const { content } = req.body;
      const replyId = req.params.replyId;
      const userId = req.user.id; // Assuming user ID is added by auth middleware
      
      // Find the reply
      const reply = await DiscussionReply.findByPk(replyId);
      
      if (!reply) {
        return res.status(404).json({ 
          success: false,
          message: 'Reply not found' 
        });
      }
      
      // Check if user is author of the reply
      if (reply.user_id !== userId) {
        return res.status(403).json({ 
          success: false,
          message: 'You are not authorized to update this reply' 
        });
      }
      
      // Update the reply
      await reply.update({ content, updated_at: new Date() });
      
      // Get updated reply with author details
      const updatedReply = await DiscussionReply.findByPk(replyId, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });
      
      res.status(200).json({ 
        success: true,
        message: 'Reply updated successfully',
        reply: updatedReply 
      });
    } catch (error) {
      console.error('Error updating discussion reply:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to update reply',
        error: error.message 
      });
    }
  }

  // Delete a reply
  async deleteReply(req, res) {
    try {
      const replyId = req.params.replyId;
      const userId = req.user.id; // Assuming user ID is added by auth middleware
      
      // Find the reply
      const reply = await DiscussionReply.findByPk(replyId);
      
      if (!reply) {
        return res.status(404).json({ 
          success: false,
          message: 'Reply not found' 
        });
      }
      
      // Check if user is author of the reply or an admin
      if (reply.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'You are not authorized to delete this reply' 
        });
      }
      
      // Delete the reply
      await reply.destroy();
      
      res.status(200).json({ 
        success: true,
        message: 'Reply deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting discussion reply:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to delete reply',
        error: error.message 
      });
    }
  }
  
  // Get a single reply by ID
  async getReplyById(req, res) {
    try {
      const replyId = req.params.replyId;
      
      const reply = await DiscussionReply.findByPk(replyId, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });
      
      if (!reply) {
        return res.status(404).json({ 
          success: false,
          message: 'Reply not found' 
        });
      }
      
      res.status(200).json({ 
        success: true,
        reply 
      });
    } catch (error) {
      console.error('Error getting discussion reply:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve reply',
        error: error.message 
      });
    }
  }
}

module.exports = new DiscussionCommentsController();