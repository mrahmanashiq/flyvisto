const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const { Logger } = require('./config');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler, apiVersioning, getVersionInfo } = require('./middlewares');
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
app.use(apiVersioning);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);
app.use(Logger.httpRequest);

// API Documentation
app.use('/api-docs', swagger.serve, swagger.setup);

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthCheck = {
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    }
  };

  try {
    // Check database connectivity
    const { sequelize } = require('./db/connect');
    await sequelize.authenticate();
    healthCheck.checks.database = 'healthy';
  } catch (error) {
    healthCheck.checks.database = 'unhealthy';
    healthCheck.success = false;
    healthCheck.message = 'Service has issues';
    Logger.error('Database health check failed', { error: error.message });
  }

  try {
    // Check Redis connectivity
    const redis = require('redis');
    const client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });
    
    await client.connect();
    await client.ping();
    await client.disconnect();
    healthCheck.checks.redis = 'healthy';
  } catch (error) {
    healthCheck.checks.redis = 'unhealthy';
    healthCheck.success = false;
    healthCheck.message = 'Service has issues';
    Logger.error('Redis health check failed', { error: error.message });
  }

  const statusCode = healthCheck.success ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      unit: 'MB'
    },
    cpu: {
      usage: process.cpuUsage(),
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
    },
    process: {
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV
    },
    requests: {
      total: global.requestCount || 0,
      errors: global.errorCount || 0,
      averageResponseTime: global.averageResponseTime || 0
    }
  };

  res.status(200).json(metrics);
});

// API version info endpoint
app.get('/api/version', getVersionInfo);

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
