const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { Logger } = require('./config');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares');
const attachCorrelationId = require('./middlewares/correlation-id');

const app = express();

app.use(helmet());
app.use(compression());
app.use(attachCorrelationId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(Logger.httpRequest);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
