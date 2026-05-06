const mongoose = require('mongoose');

const outwardEntrySchema = new mongoose.Schema({
  inwardEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InwardEntry',
    required: true
  },
  quantityRemoved: {
    type: Number,
    required: [true, 'Quantity removed is required'],
    min: [0.1, 'Quantity must be positive']
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('OutwardEntry', outwardEntrySchema);
