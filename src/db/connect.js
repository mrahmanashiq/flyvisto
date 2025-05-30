const { sequelize } = require('../models');
const { Logger } = require('../config');

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully✅');
    Logger.info('Database connection established successfully', {});
  } catch (err) {
    Logger.error('Unable to connect to the database:', {
      stack: err.stack,
      errorCode: 'DB_CONNECTION_ERROR',
    });
    process.exit(1);
  }
}

module.exports = {
  connectDB
};
