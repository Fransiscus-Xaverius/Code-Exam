const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Problem = sequelize.define('Problem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Description is required'
      }
    }
  },
  difficulty: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Easy', 'Medium', 'Hard']],
        msg: 'Difficulty must be one of: Easy, Medium, Hard'
      }
    }
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Points must be at least 1'
      }
    }
  },
  time_limit_ms: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Time limit must be at least 1 ms'
      }
    }
  },
  memory_limit_kb: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Memory limit must be at least 1 KB'
      }
    }
  },
  input_format: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  output_format: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  constraints: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sample_input: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sample_output: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  hidden_test_cases: {
    type: DataTypes.JSON,
    allowNull: true
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
  tableName: 'problems',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Association with User model
Problem.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

module.exports = Problem;