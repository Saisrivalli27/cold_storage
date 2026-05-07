const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

// Lazy initialization to avoid circular dependency
let UserModel = null;

const getUser = () => {
  if (UserModel) return UserModel;

  const sequelize = getSequelize();
  UserModel = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Name is required' } }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'Valid email is required' } }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: { args: [6], msg: 'Password must be at least 6 characters' } }
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff'),
      defaultValue: 'staff'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance method
  UserModel.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Return user without password
  UserModel.prototype.toSafeJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return UserModel;
};

module.exports = getUser;
