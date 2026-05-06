/**
 * Seed script - creates default admin user and settings.
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Settings = require('./models/Settings');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user if doesn't exist
    const existing = await User.findOne({ email: 'admin@coldstorage.com' });
    if (!existing) {
      await User.create({
        name: 'Admin',
        email: 'admin@coldstorage.com',
        password: 'Admin@123',
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@coldstorage.com / Admin@123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create default settings
    const settingsExist = await Settings.findOne();
    if (!settingsExist) {
      await Settings.create({
        totalCapacity: 100000,
        ratePerKgPerDay: 2
      });
      console.log('✅ Default settings created (100,000 kg capacity, ₹2/kg/day)');
    } else {
      console.log('ℹ️  Settings already exist');
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
