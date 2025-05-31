const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const User = db.define('user', {
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please provide a username'
      },
      len: {
        args: [1, 50],
        msg: 'Username cannot be more than 50 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      args: true,
      msg: 'Email address already in use'
    },
    validate: {
      notEmpty: {
        msg: 'Please provide an email'
      },
      isEmail: {
        msg: 'Please provide a valid email'
      }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('competitor', 'admin', 'judge'),
    defaultValue: 'competitor'
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'banned']],
        msg: 'Status must be either active, inactive or banned'
      }
    }
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_users_email',
      fields: ['email'],
      unique: true
    },
    {
      name: 'idx_users_username',
      fields: ['username']
    },
    {
      name: 'idx_users_role',
      fields: ['role']
    },
    {
      name: 'idx_users_status',
      fields: ['status']
    },
    {
      name: 'idx_users_created_at',
      fields: ['created_at']
    },
    {
      name: 'idx_users_role_status',
      fields: ['role', 'status']
    },
    {
      name: 'idx_users_full_name',
      fields: ['first_name', 'last_name']
    }
  ],
  hooks: {
    // Only needed for password updates in the future
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        // Any password update logic if needed
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = User;