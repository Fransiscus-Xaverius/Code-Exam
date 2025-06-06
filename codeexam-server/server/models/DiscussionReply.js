const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const SubmissionDiscussion = require('./SubmissionDiscussion');

const DiscussionReply = sequelize.define('DiscussionReply', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  discussion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'submission_discussions',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Content is required'
      }
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'discussion_replies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_discussion_replies_discussion_id',
      fields: ['discussion_id']
    },
    {
      name: 'idx_discussion_replies_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_discussion_replies_created_at',
      fields: ['created_at']
    },
    {
      name: 'idx_discussion_replies_discussion_created',
      fields: ['discussion_id', 'created_at']
    }
  ]
});

// Association with User model
DiscussionReply.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
});

module.exports = DiscussionReply;