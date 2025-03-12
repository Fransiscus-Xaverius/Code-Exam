const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Competition = require('./Competition');

const CompetitionParticipant = sequelize.define('CompetitionParticipant', {
  registered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'competition_participants',
  timestamps: false,
  underscored: true
});

// Define associations
CompetitionParticipant.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

CompetitionParticipant.belongsTo(Competition, {
  foreignKey: 'competition_id',
  onDelete: 'CASCADE'
});

// Add associations to User and Competition models
User.hasMany(CompetitionParticipant, {
  foreignKey: 'user_id'
});

Competition.hasMany(CompetitionParticipant, {
  foreignKey: 'competition_id'
});

// Add a many-to-many relationship through the join table
User.belongsToMany(Competition, {
  through: CompetitionParticipant,
  foreignKey: 'user_id'
});

Competition.belongsToMany(User, {
  through: CompetitionParticipant,
  foreignKey: 'competition_id',
  as: 'participants'
});

module.exports = CompetitionParticipant;