const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // If URI is Atlas (cloud), connect directly — skip memory server
    if (uri && uri.startsWith('mongodb+srv://')) {
      console.log('☁️  Connecting to MongoDB Atlas...');
    } else {
      // No Atlas URI — fall back to in-memory MongoDB for local dev
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log('⚡ Using MongoDB Memory Server (no local MongoDB detected)');
      } catch (memErr) {
        // mongodb-memory-server not available, use URI from .env as-is
      }
    }

    const conn = await mongoose.connect(uri);
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
