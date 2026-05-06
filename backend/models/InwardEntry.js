const mongoose = require('mongoose');

const inwardEntrySchema = new mongoose.Schema({
  farmerName: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  productType: {
    type: String,
    required: [true, 'Product type is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be positive']
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    default: 2,
    min: [0, 'Price must be positive']
  },
  remainingQty: {
    type: Number,
    default: 0
  },
  storageType: {
    type: String,
    enum: ['Cold', 'Frozen'],
    required: [true, 'Storage type is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  expectedDuration: {
    type: Number,
    required: [true, 'Expected duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Set remainingQty to quantity on creation
inwardEntrySchema.pre('save', function(next) {
  if (this.isNew) {
    this.remainingQty = this.quantity;
  }
  next();
});

module.exports = mongoose.model('InwardEntry', inwardEntrySchema);
