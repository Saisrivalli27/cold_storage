const express = require('express');
const InwardEntry = require('../models/InwardEntry');
const OutwardEntry = require('../models/OutwardEntry');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard - Dashboard KPIs
router.get('/dashboard', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne() || { totalCapacity: 100000, ratePerKgPerDay: 2 };

    // Total stock (sum of remainingQty of active entries)
    const stockAgg = await InwardEntry.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalStock: { $sum: '$remainingQty' } } }
    ]);
    const totalStock = stockAgg[0]?.totalStock || 0;

    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today inward
    const todayInwardAgg = await InwardEntry.aggregate([
      { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const todayInward = todayInwardAgg[0]?.total || 0;

    // Today outward
    const todayOutwardAgg = await OutwardEntry.aggregate([
      { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$quantityRemoved' } } }
    ]);
    const todayOutward = todayOutwardAgg[0]?.total || 0;

    // Total revenue estimate (all entries)
    const allEntries = await InwardEntry.find();
    let totalRevenue = 0;
    allEntries.forEach(entry => {
      const days = Math.max(
        1,
        Math.ceil((Date.now() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24))
      );
      const rate = entry.pricePerUnit !== undefined ? entry.pricePerUnit : settings.ratePerKgPerDay;
      totalRevenue += entry.quantity * days * rate;
    });

    // Product-wise stock distribution
    const productStock = await InwardEntry.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$productType', total: { $sum: '$remainingQty' } } },
      { $sort: { total: -1 } }
    ]);

    // Daily inward vs outward (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyInward = await InwardEntry.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyOutward = await OutwardEntry.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$quantityRemoved' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build 7-day chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const inw = dailyInward.find(x => x._id === key)?.total || 0;
      const outw = dailyOutward.find(x => x._id === key)?.total || 0;
      chartData.push({ date: label, inward: inw, outward: outw });
    }

    res.json({
      totalStock,
      totalCapacity: settings.totalCapacity,
      availableCapacity: settings.totalCapacity - totalStock,
      usagePercent: Math.round((totalStock / settings.totalCapacity) * 100 * 10) / 10,
      todayInward,
      todayOutward,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      productStock: productStock.map(p => ({ name: p._id, value: p.total })),
      chartData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/monthly - Monthly revenue report
router.get('/monthly', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne() || { ratePerKgPerDay: 2 };

    // Last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyInward = await InwardEntry.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          totalQty: { $sum: '$quantity' },
          entries: { $sum: 1 },
          totalRevenueFromNew: { $sum: { $multiply: ['$quantity', 30, { $ifNull: ['$pricePerUnit', settings.ratePerKgPerDay] }] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most stored product
    const topProduct = await InwardEntry.aggregate([
      { $group: { _id: '$productType', totalQty: { $sum: '$quantity' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 1 }
    ]);

    // Active entries count
    const activeCount = await InwardEntry.countDocuments({ status: 'active' });
    const completedCount = await InwardEntry.countDocuments({ status: 'completed' });

    res.json({
      monthlyData: monthlyInward.map(m => ({
        month: m._id,
        totalQty: m.totalQty,
        entries: m.entries,
        estimatedRevenue: Math.round(m.totalRevenueFromNew)
      })),
      topProduct: topProduct[0] || null,
      activeEntries: activeCount,
      completedEntries: completedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
