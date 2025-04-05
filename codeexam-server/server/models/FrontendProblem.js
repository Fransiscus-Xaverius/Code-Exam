const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const FrontendProblem = sequelize.define('FrontendProblem', {
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
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  starter_code: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'HTML/CSS/JS starter code for the problem'
  },
  expected_output_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL or path to the expected output image'
  },
  solution_code: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reference solution code'
  },
  evaluation_criteria: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON object containing evaluation criteria'
  },
  time_limit_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: {
        args: [1],
        msg: 'Time limit must be at least 1 minute'
      }
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of tags like ["HTML", "CSS", "Responsive"]'
  },
  resources: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of helpful resources for the problem'
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
  tableName: 'frontend_problems',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Association with User model
FrontendProblem.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

module.exports = FrontendProblem;