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
  underscored: true
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