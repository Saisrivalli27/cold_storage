const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed defaults
    await seedDefaults();
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

async function seedDefaults() {
  const User = require('../models/User');
  const Settings = require('../models/Settings');

  const adminExists = await User.findOne({ email: 'admin@coldstorage.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@coldstorage.com',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log('✅ Default admin created → admin@coldstorage.com / Admin@123');
  }

  const settingsExist = await Settings.findOne();
  if (!settingsExist) {
    await Settings.create({ totalCapacity: 100000, ratePerKgPerDay: 2 });
    console.log('✅ Default settings created');
  }
}

module.exports = connectDB;
