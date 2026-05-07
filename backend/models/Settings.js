const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

let SettingsModel = null;

const getSettings = () => {
  if (SettingsModel) return SettingsModel;

  const sequelize = getSequelize();
  SettingsModel = sequelize.define('Settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    totalCapacity: {
      type: DataTypes.FLOAT,
      defaultValue: 100000,
      validate: { min: { args: [1], msg: 'Capacity must be positive' } }
    },
    ratePerKgPerDay: {
      type: DataTypes.FLOAT,
      defaultValue: 2,
      validate: { min: { args: [0.01], msg: 'Rate must be positive' } }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'settings',
    timestamps: true
  });

  return SettingsModel;
};

module.exports = getSettings;
