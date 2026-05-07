const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// GET /api/settings
router.get('/', auth, async (req, res) => {
  try {
    const Settings = require('../models/Settings')();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        totalCapacity: 100000,
        ratePerKgPerDay: 2
      });
    }
    const result = settings.toJSON();
    result._id = result.id;
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings
router.put('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const Settings = require('../models/Settings')();
    const { totalCapacity, ratePerKgPerDay } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        totalCapacity: totalCapacity || 100000,
        ratePerKgPerDay: ratePerKgPerDay || 2,
        updatedBy: req.user.id
      });
    } else {
      const updates = { updatedBy: req.user.id };
      if (totalCapacity !== undefined) updates.totalCapacity = totalCapacity;
      if (ratePerKgPerDay !== undefined) updates.ratePerKgPerDay = ratePerKgPerDay;
      await settings.update(updates);
    }
    const result = settings.toJSON();
    result._id = result.id;
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
