const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return; // Reuse connection in serverless

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    // Auto-seed defaults
    await seedDefaults();
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    throw error;
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
