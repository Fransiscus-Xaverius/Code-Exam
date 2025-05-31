const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const FrontendProblem = require('./FrontendProblem');

const FrontendSubmission = sequelize.define('FrontendSubmission', {
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
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'frontend_problems',
      key: 'id'
    }
  },
  html_code: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  css_code: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  js_code: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  screenshot_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'submitted', 'graded']],
        msg: 'Status must be one of: pending, submitted, graded'
      }
    }
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  judge_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  judged_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'frontend_submissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_frontend_submissions_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_frontend_submissions_problem_id',
      fields: ['problem_id']
    },
    {
      name: 'idx_frontend_submissions_status',
      fields: ['status']
    },
    {
      name: 'idx_frontend_submissions_judge_id',
      fields: ['judge_id']
    },
    {
      name: 'idx_frontend_submissions_created_at',
      fields: ['created_at']
    },
    {
      name: 'idx_frontend_submissions_judged_at',
      fields: ['judged_at']
    },
    {
      name: 'idx_frontend_submissions_score',
      fields: ['score']
    },
    {
      name: 'idx_frontend_submissions_user_problem',
      fields: ['user_id', 'problem_id']
    },
    {
      name: 'idx_frontend_submissions_problem_status',
      fields: ['problem_id', 'status']
    }
  ]
});

// Associations
FrontendSubmission.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

FrontendSubmission.belongsTo(FrontendProblem, {
  foreignKey: 'problem_id',
  as: 'problem'
});

FrontendSubmission.belongsTo(User, {
  foreignKey: 'judge_id',
  as: 'judge'
});

module.exports = FrontendSubmission;