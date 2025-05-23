const express = require('express');
const { PORT, Logger } = require('./config/index.js');
const apiRoutes = require('./routes/index.js');
const { notFoundHandler, errorHandler } = require('./middlewares/index.js');

const app = express();

app.use(express.json());
app.use(Logger.httpRequest);

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  Logger.info("Successfully started the server", {});
});

process.on('uncaughtException', (err) => {
  Logger.error('UNCAUGHT EXCEPTION! Shutting down...', { 
    stack: err.stack,
    errorCode: 'UNCAUGHT_EXCEPTION'
  });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  Logger.error('UNHANDLED REJECTION! Shutting down...', { 
    stack: err.stack,
    errorCode: 'UNHANDLED_REJECTION'
  });
  process.exit(1);
});
