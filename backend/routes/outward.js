const express = require('express');
const { body, validationResult } = require('express-validator');
const OutwardEntry = require('../models/OutwardEntry');
const InwardEntry = require('../models/InwardEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/outward - Create outward entry (remove stock)
router.post('/', auth, [
  body('inwardEntry').notEmpty().withMessage('Inward entry ID is required'),
  body('quantityRemoved').isFloat({ min: 0.1 }).withMessage('Quantity must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { inwardEntry: inwardId, quantityRemoved } = req.body;
    const qty = parseFloat(quantityRemoved);

    // Find the inward entry
    const inwardEntry = await InwardEntry.findById(inwardId);
    if (!inwardEntry) {
      return res.status(404).json({ message: 'Inward entry not found' });
    }

    // Check if enough stock
    if (qty > inwardEntry.remainingQty) {
      return res.status(400).json({
        message: `Cannot remove ${qty} kg. Only ${inwardEntry.remainingQty} kg available.`
      });
    }

    // Create outward entry
    const outward = new OutwardEntry({
      inwardEntry: inwardId,
      quantityRemoved: qty,
      date: req.body.date || new Date(),
      createdBy: req.user._id
    });
    await outward.save();

    // Update remaining quantity
    inwardEntry.remainingQty -= qty;
    if (inwardEntry.remainingQty <= 0) {
      inwardEntry.remainingQty = 0;
      inwardEntry.status = 'completed';
    }
    await inwardEntry.save();

    res.status(201).json({
      outward,
      updatedInward: {
        _id: inwardEntry._id,
        remainingQty: inwardEntry.remainingQty,
        status: inwardEntry.status
      }
    });
  } catch (error) {
    console.error('Outward create error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/outward - List all outward entries
router.get('/', auth, async (req, res) => {
  try {
    const entries = await OutwardEntry.find()
      .populate({
        path: 'inwardEntry',
        select: 'farmerName productType quantity storageType'
      })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    console.error('Outward list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
