const express = require('express');
const { generateInvoice } = require('../utils/pdfGenerator');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/billing/calculate/:id - Calculate bill for an entry
router.get('/calculate/:id', auth, async (req, res) => {
  try {
    const InwardEntry = require('../models/InwardEntry')();
    const Settings = require('../models/Settings')();

    const entry = await InwardEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const settings = await Settings.findOne() || { ratePerKgPerDay: 2 };
    const daysStored = Math.max(
      1,
      Math.ceil((Date.now() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24))
    );
    const totalCost = entry.quantity * daysStored * settings.ratePerKgPerDay;

    res.json({
      entryId: entry.id,
      _id: entry.id,
      farmerName: entry.farmerName,
      productType: entry.productType,
      quantity: entry.quantity,
      daysStored,
      ratePerKgPerDay: settings.ratePerKgPerDay,
      totalCost: Math.round(totalCost * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/billing/invoice/:id - Generate PDF invoice
router.post('/invoice/:id', auth, async (req, res) => {
  try {
    const InwardEntry = require('../models/InwardEntry')();
    const Settings = require('../models/Settings')();

    const entry = await InwardEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const settings = await Settings.findOne() || { ratePerKgPerDay: 2 };

    // Add _id for PDF generator compatibility
    const entryData = entry.toJSON();
    entryData._id = entryData.id;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${entry.id}.pdf`);

    generateInvoice(entryData, settings, res);
  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
