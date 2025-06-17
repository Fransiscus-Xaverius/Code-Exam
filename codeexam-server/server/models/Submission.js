const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Problem = require('./Problem');

const Submission = sequelize.define('Submission', {
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
  code: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Code is required'
      }
    }
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Programming language is required'
      }
    }
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'judging', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error', 'runtime_error']],
        msg: 'Invalid status value'
      }
    }
  },
  execution_time_ms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  memory_used_kb: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  test_results: {
    type: DataTypes.JSON,
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
  judge_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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
  },
  compile_error: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'submissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_submissions_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_submissions_problem_id',
      fields: ['problem_id']
    },
    {
      name: 'idx_submissions_competition_id',
      fields: ['competition_id']
    },
    {
      name: 'idx_submissions_status',
      fields: ['status']
    },
    {
      name: 'idx_submissions_language',
      fields: ['language']
    },
    {
      name: 'idx_submissions_judge_id',
      fields: ['judge_id']
    },
    {
      name: 'idx_submissions_submitted_at',
      fields: ['submitted_at']
    },
    {
      name: 'idx_submissions_judged_at',
      fields: ['judged_at']
    },
    {
      name: 'idx_submissions_created_at',
      fields: ['created_at']
    },
    {
      name: 'idx_submissions_score',
      fields: ['score']
    },
    {
      name: 'idx_submissions_execution_time',
      fields: ['execution_time_ms']
    },
    {
      name: 'idx_submissions_memory_used',
      fields: ['memory_used_kb']
    },
    {
      name: 'idx_submissions_is_published',
      fields: ['is_published']
    },
    {
      name: 'idx_submissions_user_problem',
      fields: ['user_id', 'problem_id']
    },
    {
      name: 'idx_submissions_problem_status',
      fields: ['problem_id', 'status']
    },
    {
      name: 'idx_submissions_competition_user',
      fields: ['competition_id', 'user_id']
    },
    {
      name: 'idx_submissions_user_submitted_at',
      fields: ['user_id', 'submitted_at']
    },
    {
      name: 'idx_submissions_status_judged_at',
      fields: ['status', 'judged_at']
    }
  ]
});

// Associations
Submission.belongsTo(require('./User'), {
  foreignKey: 'user_id',
  as: 'user'
});

Submission.belongsTo(require('./Problem'), {
  foreignKey: 'problem_id',
  as: 'problem'
});

Submission.belongsTo(require('./User'), {
  foreignKey: 'judge_id',
  as: 'judge'
});

module.exports = Submission;