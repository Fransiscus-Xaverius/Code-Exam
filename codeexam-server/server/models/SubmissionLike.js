const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubmissionLike = sequelize.define('SubmissionLike', {
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
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'submission_likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_submission_likes_submission_id',
      fields: ['submission_id']
    },
    {
      name: 'idx_submission_likes_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_submission_likes_created_at',
      fields: ['created_at']
    },
    {
      unique: true,
      name: 'unique_submission_like',
      fields: ['submission_id', 'user_id']
    }
  ]
});

module.exports = SubmissionLike;