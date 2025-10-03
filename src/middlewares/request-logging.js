const { Logger } = require('../config');

/**
 * Enhanced Request Logging Middleware
 * Logs detailed request information for monitoring and debugging
 */

// Track request metrics
let requestMetrics = {
  totalRequests: 0,
  totalResponseTime: 0,
  requestsByMethod: {},
  requestsByStatus: {},
  requestsByRoute: {},
  averageResponseTime: 0
};

/**
 * Enhanced HTTP Request Logger
 */
const httpRequestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.correlationId || 'unknown';
  
  // Increment request counter
  requestMetrics.totalRequests++;
  
  // Track method
  if (!requestMetrics.requestsByMethod[req.method]) {
    requestMetrics.requestsByMethod[req.method] = 0;
  }
  requestMetrics.requestsByMethod[req.method]++;
  
  // Track route
  const route = req.route ? req.route.path : req.path;
  if (!requestMetrics.requestsByRoute[route]) {
    requestMetrics.requestsByRoute[route] = 0;
  }
  requestMetrics.requestsByRoute[route]++;

  // Log request start
  Logger.info('Request Started', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    headers: {
      'user-agent': req.get('User-Agent'),
      'content-type': req.get('Content-Type'),
      'content-length': req.get('Content-Length'),
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-real-ip': req.get('X-Real-IP')
    },
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    apiVersion: req.apiVersion,
    timestamp: new Date().toISOString()
  });

  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Update metrics
    requestMetrics.totalResponseTime += responseTime;
    requestMetrics.averageResponseTime = 
      requestMetrics.totalResponseTime / requestMetrics.totalRequests;
    
    // Track status codes
    if (!requestMetrics.requestsByStatus[res.statusCode]) {
      requestMetrics.requestsByStatus[res.statusCode] = 0;
    }
    requestMetrics.requestsByStatus[res.statusCode]++;

    // Log response
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    Logger[logLevel]('Request Completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('Content-Length') || 0,
      apiVersion: req.apiVersion,
      timestamp: new Date().toISOString()
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Get request metrics
 */
const getRequestMetrics = () => {
  return {
    ...requestMetrics,
    timestamp: new Date().toISOString()
  };
};

/**
 * Reset request metrics
 */
const resetRequestMetrics = () => {
  requestMetrics = {
    totalRequests: 0,
    totalResponseTime: 0,
    requestsByMethod: {},
    requestsByStatus: {},
    requestsByRoute: {},
    averageResponseTime: 0
  };
};

/**
 * Middleware to log slow requests
 */
const slowRequestLogger = (threshold = 1000) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const responseTime = Date.now() - startTime;
      
      if (responseTime > threshold) {
        Logger.warn('Slow Request Detected', {
          requestId: req.correlationId,
          method: req.method,
          url: req.originalUrl,
          responseTime: `${responseTime}ms`,
          threshold: `${threshold}ms`,
          apiVersion: req.apiVersion,
          timestamp: new Date().toISOString()
        });
      }
      
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

/**
 * Middleware to log request body for debugging
 */
const requestBodyLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0) {
    Logger.debug('Request Body', {
      requestId: req.correlationId,
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = {
  httpRequestLogger,
  getRequestMetrics,
  resetRequestMetrics,
  slowRequestLogger,
  requestBodyLogger
};
