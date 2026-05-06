const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const InwardEntry = require('../models/InwardEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only image files (jpg, png, webp) are allowed'));
  }
});

// POST /api/inward - Create new inward entry
router.post('/', auth, upload.single('image'), [
  body('farmerName').notEmpty().withMessage('Farmer name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('productType').notEmpty().withMessage('Product type is required'),
  body('quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be positive'),
  body('pricePerUnit').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('storageType').isIn(['Cold', 'Frozen']).withMessage('Storage type must be Cold or Frozen'),
  body('expectedDuration').isInt({ min: 1 }).withMessage('Duration must be at least 1 day')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entryData = {
      farmerName: req.body.farmerName,
      phone: req.body.phone,
      productType: req.body.productType,
      quantity: parseFloat(req.body.quantity),
      pricePerUnit: req.body.pricePerUnit !== undefined ? parseFloat(req.body.pricePerUnit) : 2,
      storageType: req.body.storageType,
      date: req.body.date || new Date(),
      expectedDuration: parseInt(req.body.expectedDuration),
      createdBy: req.user._id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    };

    const entry = new InwardEntry(entryData);
    await entry.save();

    res.status(201).json(entry);
  } catch (error) {
    console.error('Inward create error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/inward - List all inward entries
router.get('/', auth, async (req, res) => {
  try {
    const { product, status, startDate, endDate } = req.query;
    const filter = {};
    if (product) filter.productType = new RegExp(product, 'i');
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const entries = await InwardEntry.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    console.error('Inward list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/inward/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await InwardEntry.findById(req.params.id).populate('createdBy', 'name');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
