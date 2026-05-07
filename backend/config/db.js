const { Sequelize } = require('sequelize');

let sequelize;
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return sequelize;

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    sequelize = new Sequelize(dbUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected via Sequelize');

    // Import models (they are factory functions) and create associations
    const User = require('../models/User')();
    const InwardEntry = require('../models/InwardEntry')();
    const OutwardEntry = require('../models/OutwardEntry')();
    const Settings = require('../models/Settings')();

    // Define associations
    InwardEntry.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
    OutwardEntry.belongsTo(InwardEntry, { as: 'inwardEntry', foreignKey: 'inwardEntryId' });
    OutwardEntry.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
    Settings.belongsTo(User, { as: 'updater', foreignKey: 'updatedBy' });

    // Sync all tables (create if not exists)
    await sequelize.sync();
    console.log('✅ Database tables synced');

    // Seed defaults
    await seedDefaults(User, Settings);

    isConnected = true;
    return sequelize;
  } catch (error) {
    console.error(`❌ Database Error: ${error.message}`);
    throw error;
  }
};

async function seedDefaults(User, Settings) {
  const bcrypt = require('bcryptjs');

  const adminExists = await User.findOne({ where: { email: 'admin@coldstorage.com' } });
  if (!adminExists) {
    // beforeCreate hook in User model will hash the password
    await User.create({
      name: 'Admin',
      email: 'admin@coldstorage.com',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log('✅ Default admin created → admin@coldstorage.com / Admin@123');
  } else {
    // Fix: if admin exists but password is wrong (from a bad earlier sync), reset it
    const isValid = await bcrypt.compare('Admin@123', adminExists.password);
    if (!isValid) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      await adminExists.update({ password: hashedPassword }, { hooks: false });
      console.log('🔄 Admin password reset → Admin@123');
    }
  }

  const settingsExist = await Settings.findOne();
  if (!settingsExist) {
    await Settings.create({ totalCapacity: 100000, ratePerKgPerDay: 2 });
    console.log('✅ Default settings created');
  }
}

const getSequelize = () => sequelize;

module.exports = { connectDB, getSequelize };
