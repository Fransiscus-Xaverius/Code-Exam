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
  updatedAt: 'updated_at'
});

// Association with User model
Competition.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

module.exports = Competition;