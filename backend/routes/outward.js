const express = require('express');
const { body, validationResult } = require('express-validator');
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

    const InwardEntry = require('../models/InwardEntry')();
    const OutwardEntry = require('../models/OutwardEntry')();

    const { inwardEntry: inwardId, quantityRemoved } = req.body;
    const qty = parseFloat(quantityRemoved);

    // Find the inward entry
    const inwardEntry = await InwardEntry.findByPk(inwardId);
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
    const outward = await OutwardEntry.create({
      inwardEntryId: inwardId,
      quantityRemoved: qty,
      date: req.body.date || new Date(),
      createdBy: req.user.id
    });

    // Update remaining quantity
    let newRemaining = inwardEntry.remainingQty - qty;
    let newStatus = inwardEntry.status;
    if (newRemaining <= 0) {
      newRemaining = 0;
      newStatus = 'completed';
    }

    await inwardEntry.update({ remainingQty: newRemaining, status: newStatus });

    const outwardResult = outward.toJSON();
    outwardResult._id = outwardResult.id;

    res.status(201).json({
      outward: outwardResult,
      updatedInward: {
        _id: inwardEntry.id,
        remainingQty: newRemaining,
        status: newStatus
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
    const InwardEntry = require('../models/InwardEntry')();
    const OutwardEntry = require('../models/OutwardEntry')();
    const User = require('../models/User')();

    const entries = await OutwardEntry.findAll({
      include: [
        {
          model: InwardEntry,
          as: 'inwardEntry',
          attributes: ['farmerName', 'productType', 'quantity', 'storageType']
        },
        { model: User, as: 'creator', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const result = entries.map(e => {
      const obj = e.toJSON();
      obj._id = obj.id;
      if (obj.inwardEntry) obj.inwardEntry._id = obj.inwardEntry.id;
      obj.createdBy = obj.creator;
      return obj;
    });

    res.json(result);
  } catch (error) {
    console.error('Outward list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
