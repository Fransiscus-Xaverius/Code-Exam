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
  }
}, {
  tableName: 'submissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
Submission.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Submission.belongsTo(Problem, {
  foreignKey: 'problem_id',
  as: 'problem'
});

Submission.belongsTo(User, {
  foreignKey: 'judge_id',
  as: 'judge'
});

module.exports = Submission;