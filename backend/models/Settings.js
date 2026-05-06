const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  totalCapacity: {
    type: Number,
    default: 100000, // 100,000 kg
    min: [1, 'Capacity must be positive']
  },
  ratePerKgPerDay: {
    type: Number,
    default: 2, // ₹2 per kg per day
    min: [0.01, 'Rate must be positive']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
