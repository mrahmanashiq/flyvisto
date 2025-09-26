const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const { Logger } = require('./config');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares');
const attachCorrelationId = require('./middlewares/correlation-id');
const {
  corsOptions,
  generalLimiter,
  sanitizeInput,
  securityHeaders,
  requestSizeLimit,
} = require('./middlewares/security-middleware');
const swagger = require('./config/swagger');

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(requestSizeLimit);
app.use(generalLimiter);
app.use(compression());

// Request processing middleware
app.use(attachCorrelationId);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);
app.use(Logger.httpRequest);

// API Documentation
app.use('/api-docs', swagger.serve, swagger.setup);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
