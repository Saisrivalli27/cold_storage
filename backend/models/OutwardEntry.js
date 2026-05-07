const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

let OutwardEntryModel = null;

const getOutwardEntry = () => {
  if (OutwardEntryModel) return OutwardEntryModel;

  const sequelize = getSequelize();
  OutwardEntryModel = sequelize.define('OutwardEntry', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    inwardEntryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantityRemoved: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: { args: [0.1], msg: 'Quantity must be positive' } }
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'outward_entries',
    timestamps: true
  });

  return OutwardEntryModel;
};

module.exports = getOutwardEntry;
