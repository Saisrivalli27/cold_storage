const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard - Dashboard KPIs
router.get('/dashboard', auth, async (req, res) => {
  try {
    const InwardEntry = require('../models/InwardEntry')();
    const OutwardEntry = require('../models/OutwardEntry')();
    const Settings = require('../models/Settings')();

    const settings = await Settings.findOne() || { totalCapacity: 100000, ratePerKgPerDay: 2 };

    // Total stock (sum of remainingQty of active entries)
    const stockResult = await InwardEntry.sum('remainingQty', { where: { status: 'active' } });
    const totalStock = stockResult || 0;

    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today inward
    const todayInwardResult = await InwardEntry.sum('quantity', {
      where: { date: { [Op.between]: [todayStart, todayEnd] } }
    });
    const todayInward = todayInwardResult || 0;

    // Today outward
    const todayOutwardResult = await OutwardEntry.sum('quantityRemoved', {
      where: { date: { [Op.between]: [todayStart, todayEnd] } }
    });
    const todayOutward = todayOutwardResult || 0;

    // Total revenue estimate
    const allEntries = await InwardEntry.findAll();
    let totalRevenue = 0;
    allEntries.forEach(entry => {
      const days = Math.max(
        1,
        Math.ceil((Date.now() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24))
      );
      const rate = entry.pricePerUnit !== null ? entry.pricePerUnit : settings.ratePerKgPerDay;
      totalRevenue += entry.quantity * days * rate;
    });

    // Product-wise stock distribution
    const productStock = await InwardEntry.findAll({
      attributes: ['productType', [fn('SUM', col('remainingQty')), 'total']],
      where: { status: 'active' },
      group: ['productType'],
      order: [[literal('total'), 'DESC']],
      raw: true
    });

    // Daily inward vs outward (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyInward = await InwardEntry.findAll({
      attributes: [
        [fn('DATE', col('date')), 'day'],
        [fn('SUM', col('quantity')), 'total']
      ],
      where: { date: { [Op.gte]: sevenDaysAgo } },
      group: [fn('DATE', col('date'))],
      order: [[fn('DATE', col('date')), 'ASC']],
      raw: true
    });

    const dailyOutward = await OutwardEntry.findAll({
      attributes: [
        [fn('DATE', col('date')), 'day'],
        [fn('SUM', col('quantityRemoved')), 'total']
      ],
      where: { date: { [Op.gte]: sevenDaysAgo } },
      group: [fn('DATE', col('date'))],
      order: [[fn('DATE', col('date')), 'ASC']],
      raw: true
    });

    // Build 7-day chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const inw = dailyInward.find(x => x.day === key)?.total || 0;
      const outw = dailyOutward.find(x => x.day === key)?.total || 0;
      chartData.push({ date: label, inward: parseFloat(inw), outward: parseFloat(outw) });
    }

    res.json({
      totalStock,
      totalCapacity: settings.totalCapacity,
      availableCapacity: settings.totalCapacity - totalStock,
      usagePercent: Math.round((totalStock / settings.totalCapacity) * 100 * 10) / 10,
      todayInward,
      todayOutward,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      productStock: productStock.map(p => ({ name: p.productType, value: parseFloat(p.total) })),
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
    const InwardEntry = require('../models/InwardEntry')();
    const Settings = require('../models/Settings')();

    const settings = await Settings.findOne() || { ratePerKgPerDay: 2 };

    // Last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyInward = await InwardEntry.findAll({
      attributes: [
        [fn('to_char', col('date'), 'YYYY-MM'), 'month'],
        [fn('SUM', col('quantity')), 'totalQty'],
        [fn('COUNT', col('id')), 'entries']
      ],
      where: { date: { [Op.gte]: sixMonthsAgo } },
      group: [fn('to_char', col('date'), 'YYYY-MM')],
      order: [[literal("to_char(date, 'YYYY-MM')"), 'ASC']],
      raw: true
    });

    // Most stored product
    const topProduct = await InwardEntry.findAll({
      attributes: ['productType', [fn('SUM', col('quantity')), 'totalQty']],
      group: ['productType'],
      order: [[literal('totalQty'), 'DESC']],
      limit: 1,
      raw: true
    });

    // Active & completed counts
    const activeCount = await InwardEntry.count({ where: { status: 'active' } });
    const completedCount = await InwardEntry.count({ where: { status: 'completed' } });

    res.json({
      monthlyData: monthlyInward.map(m => ({
        month: m.month,
        totalQty: parseFloat(m.totalQty),
        entries: parseInt(m.entries),
        estimatedRevenue: Math.round(parseFloat(m.totalQty) * 30 * settings.ratePerKgPerDay)
      })),
      topProduct: topProduct[0] ? { _id: topProduct[0].productType, totalQty: parseFloat(topProduct[0].totalQty) } : null,
      activeEntries: activeCount,
      completedEntries: completedCount
    });
  } catch (error) {
    console.error('Monthly error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
