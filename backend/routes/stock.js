const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/stock - Current stock with filters
router.get('/', auth, async (req, res) => {
  try {
    const InwardEntry = require('../models/InwardEntry')();
    const User = require('../models/User')();
    const { product, storageType, status } = req.query;
    const where = {};

    if (product) where.productType = { [Op.iLike]: `%${product}%` };
    if (storageType) where.storageType = storageType;
    if (status) {
      where.status = status;
    } else {
      where.status = 'active';
    }

    const stock = await InwardEntry.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['name'] }],
      order: [['date', 'DESC']]
    });

    // Add computed fields
    const enriched = stock.map(item => {
      const obj = item.toJSON();
      obj._id = obj.id;
      obj.createdBy = obj.creator;
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
    const InwardEntry = require('../models/InwardEntry')();
    const activeEntries = await InwardEntry.findAll({ where: { status: 'active' } });

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
          entryId: item.id,
          severity: 'high'
        });
      } else if (remaining <= 3) {
        alerts.push({
          type: 'nearExpiry',
          message: `${item.productType} from ${item.farmerName} expires in ${remaining} day(s)`,
          entryId: item.id,
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
