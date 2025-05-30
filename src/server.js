const app = require('./app');
const { PORT, Logger } = require('./config');
const { connectDB } = require('./db/connect');

(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    Logger.info('Successfully started the server', {});
  });
})();

process.on('uncaughtException', (err) => {
  Logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    stack: err.stack,
    errorCode: 'UNCAUGHT_EXCEPTION',
  });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  Logger.error('UNHANDLED REJECTION! Shutting down...', {
    stack: err.stack,
    errorCode: 'UNHANDLED_REJECTION',
  });
  process.exit(1);
});
