const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// GET /api/settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        totalCapacity: 100000,
        ratePerKgPerDay: 2
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings
router.put('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { totalCapacity, ratePerKgPerDay } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    if (totalCapacity !== undefined) settings.totalCapacity = totalCapacity;
    if (ratePerKgPerDay !== undefined) settings.ratePerKgPerDay = ratePerKgPerDay;
    settings.updatedBy = req.user._id;
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
