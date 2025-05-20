const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Problem = require('./Problem');
const Competition = require('./Competition');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
        msg: 'Feedback content is required'
      }
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Rating must be at least 1'
      },
      max: {
        args: [5],
        msg: 'Rating must be at most 5'
      }
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: {
        args: [['problem', 'platform', 'competition', 'general']],
        msg: 'Category must be one of: problem, platform, competition, general'
      }
    }
  },
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'problems',
      key: 'id'
    }
  },
  competition_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'competitions',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unread',
    validate: {
      isIn: {
        args: [['unread', 'read', 'addressed']],
        msg: 'Status must be one of: unread, read, addressed'
      }
    }
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
  tableName: 'feedbacks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Association with User model
Feedback.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Association with Problem model (optional)
Feedback.belongsTo(Problem, {
  foreignKey: 'problem_id',
  as: 'problem'
});

// Association with Competition model (optional)
Feedback.belongsTo(Competition, {
  foreignKey: 'competition_id',
  as: 'competition'
});

module.exports = Feedback;