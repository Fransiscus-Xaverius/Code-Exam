const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Competition = sequelize.define('Competition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Name is required'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Start time is required'
      }
    }
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'End time is required'
      }
    }
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  registration_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  leaderboard_visible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  test_time_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Test time limit in minutes'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  tableName: 'competitions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_competitions_created_by',
      fields: ['created_by']
    },
    {
      name: 'idx_competitions_start_time',
      fields: ['start_time']
    },
    {
      name: 'idx_competitions_end_time',
      fields: ['end_time']
    },
    {
      name: 'idx_competitions_time_range',
      fields: ['start_time', 'end_time']
    },
    {
      name: 'idx_competitions_is_public',
      fields: ['is_public']
    },
    {
      name: 'idx_competitions_registration_required',
      fields: ['registration_required']
    },
    {
      name: 'idx_competitions_public_active',
      fields: ['is_public', 'start_time', 'end_time']
    },
    {
      name: 'idx_competitions_created_at',
      fields: ['created_at']
    }
  ]
});

// Association with User model
Competition.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

module.exports = Competition;