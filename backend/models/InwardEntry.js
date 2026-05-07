const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

let InwardEntryModel = null;

const getInwardEntry = () => {
  if (InwardEntryModel) return InwardEntryModel;

  const sequelize = getSequelize();
  InwardEntryModel = sequelize.define('InwardEntry', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    farmerName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Farmer name is required' } }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Phone number is required' } }
    },
    productType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Product type is required' } }
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: { args: [0.1], msg: 'Quantity must be positive' } }
    },
    pricePerUnit: {
      type: DataTypes.FLOAT,
      defaultValue: 2,
      validate: { min: { args: [0], msg: 'Price must be positive' } }
    },
    remainingQty: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    storageType: {
      type: DataTypes.ENUM('Cold', 'Frozen'),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expectedDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [1], msg: 'Duration must be at least 1 day' } }
    },
    imageUrl: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    status: {
      type: DataTypes.ENUM('active', 'completed'),
      defaultValue: 'active'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'inward_entries',
    timestamps: true,
    hooks: {
      beforeCreate: (entry) => {
        entry.remainingQty = entry.quantity;
      }
    }
  });

  return InwardEntryModel;
};

module.exports = getInwardEntry;
