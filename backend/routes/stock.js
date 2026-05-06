const express = require('express');
const InwardEntry = require('../models/InwardEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/stock - Current stock with filters
router.get('/', auth, async (req, res) => {
  try {
    const { product, storageType, status } = req.query;
    const filter = {};
    if (product) filter.productType = new RegExp(product, 'i');
    if (storageType) filter.storageType = storageType;
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'active'; // Default: show only active
    }

    const stock = await InwardEntry.find(filter)
      .populate('createdBy', 'name')
      .sort({ date: -1 });

    // Add computed fields
    const enriched = stock.map(item => {
      const obj = item.toObject();
      const daysPassed = Math.ceil(
        (Date.now() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      obj.daysPassed = daysPassed;
      obj.remainingDays = Math.max(0, item.expectedDuration - daysPassed);
      obj.isExpired = daysPassed > item.expectedDuration;
      obj.isNearExpiry = !obj.isExpired && obj.remainingDays <= 3;
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    console.error('Stock list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/stock/alerts - Stock nearing expiry or expired
router.get('/alerts', auth, async (req, res) => {
  try {
    const activeEntries = await InwardEntry.find({ status: 'active' });

    const alerts = [];
    activeEntries.forEach(item => {
      const daysPassed = Math.ceil(
        (Date.now() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const remaining = item.expectedDuration - daysPassed;

      if (remaining < 0) {
        alerts.push({
          type: 'expired',
          message: `${item.productType} from ${item.farmerName} has exceeded storage duration by ${Math.abs(remaining)} days`,
          entryId: item._id,
          severity: 'high'
        });
      } else if (remaining <= 3) {
        alerts.push({
          type: 'nearExpiry',
          message: `${item.productType} from ${item.farmerName} expires in ${remaining} day(s)`,
          entryId: item._id,
          severity: 'medium'
        });
      }
    });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
