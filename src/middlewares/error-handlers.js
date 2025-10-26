const { Logger } = require('../config');
const { StatusCodes } = require('http-status-codes');

/**
 * Handles 404 errors for routes that don't exist
 */
const notFoundHandler = (req, res, _next) => {
  const errorDetails = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  };

  Logger.warn(`404 Not Found: ${req.originalUrl}`, errorDetails);

  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Resource not found',
    code: 'RESOURCE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  });
};

/**
 * Handles all other uncaught errors
 */
const errorHandler = (err, req, res, _next) => {
  const errorDetails = {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    body: req.body,
    query: req.query,
    params: req.params,
  };

  // Add correlation ID if present
  if (req.correlationId) {
    errorDetails.correlationId = req.correlationId;
  }

  // Set appropriate status code
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  // Log with appropriate level based on status code
  if (statusCode >= 500) {
    Logger.error(`Server Error: ${err.message}`, errorDetails);
  } else {
    Logger.warn(`Client Error: ${err.message}`, errorDetails);
  }

  // Increment error counter for metrics
  if (global.errorCount === undefined) {
    global.errorCount = 0;
  }
  global.errorCount++;

  // Prepare error response
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Add validation errors if present
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  // Add request ID for tracking
  if (req.correlationId) {
    response.requestId = req.correlationId;
  }

  // Don't expose stack trace in production
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    response.details = errorDetails;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
