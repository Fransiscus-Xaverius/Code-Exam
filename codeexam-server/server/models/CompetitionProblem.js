const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Competition = require('./Competition');
const Problem = require('./Problem');

const CompetitionProblem = sequelize.define('CompetitionProblem', {
  competition_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Competition,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  problem_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Problem,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'competition_problems',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      name: 'idx_comp_problems_competition_id',
      fields: ['competition_id']
    },
    {
      name: 'idx_comp_problems_problem_id',
      fields: ['problem_id']
    },
    {
      name: 'idx_comp_problems_order',
      fields: ['competition_id', 'order_index']
    },
    {
      name: 'idx_comp_problems_unique',
      fields: ['competition_id', 'problem_id'],
      unique: true
    }
  ]
});

// Define associations
CompetitionProblem.belongsTo(Problem, {
  foreignKey: 'problem_id',
  onDelete: 'CASCADE'
});

CompetitionProblem.belongsTo(Competition, {
  foreignKey: 'competition_id',
  onDelete: 'CASCADE'
});

// Add associations to Problem and Competition models
Problem.hasMany(CompetitionProblem, {
  foreignKey: 'problem_id'
});

Competition.hasMany(CompetitionProblem, {
  foreignKey: 'competition_id'
});

// Add a many-to-many relationship through the join table
Problem.belongsToMany(Competition, {
  through: CompetitionProblem,
  foreignKey: 'problem_id'
});

Competition.belongsToMany(Problem, {
  through: CompetitionProblem,
  foreignKey: 'competition_id',
  as: 'problems'
});

module.exports = CompetitionProblem;