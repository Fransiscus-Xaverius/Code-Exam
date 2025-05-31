const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Warning = db.define('warning', {
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
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Warning reason is required'
      },
      len: {
        args: [1, 1000],
        msg: 'Warning reason must be between 1 and 1000 characters'
      }
    }
  }
}, {
  tableName: 'warnings',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_warnings_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_warnings_admin_id',
      fields: ['admin_id']
    },
    {
      name: 'idx_warnings_created_at',
      fields: ['created_at']
    },
    {
      name: 'idx_warnings_user_created',
      fields: ['user_id', 'created_at']
    }
  ]
});

// Define associations
Warning.belongsTo(require('./User'), { 
  foreignKey: 'user_id', 
  as: 'user',
  onDelete: 'CASCADE'
});

Warning.belongsTo(require('./User'), { 
  foreignKey: 'admin_id', 
  as: 'admin',
  onDelete: 'RESTRICT' // Don't allow deleting admin if they have warnings
});

module.exports = Warning;