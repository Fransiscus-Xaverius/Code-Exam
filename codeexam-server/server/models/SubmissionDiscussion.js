const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Submission = require('./Submission');
const DiscussionReply = require('./DiscussionReply');

const SubmissionDiscussion = sequelize.define('SubmissionDiscussion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'submissions',
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Title is required'
      }
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
  tableName: 'submission_discussions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Association with User model
SubmissionDiscussion.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
});

// Association with Submission model
SubmissionDiscussion.belongsTo(Submission, {
  foreignKey: 'submission_id',
  as: 'submission'
});

//Defined here because SubmissionDiscussion is defined later on the database -FX
Submission.hasOne(SubmissionDiscussion, {
  foreignKey: 'submission_id',
  as: 'submission_discussions'  // Use plural for hasMany relationships
}); 

// Association with SubmissionDiscussion model
DiscussionReply.belongsTo(SubmissionDiscussion, {
  foreignKey: 'discussion_id',
  as: 'discussion'
});

module.exports = SubmissionDiscussion;