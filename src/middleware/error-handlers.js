import { Logger } from '../config/index.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Handles 404 errors for routes that don't exist
 */
export const notFoundHandler = (req, res, next) => {
  const errorDetails = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    headers: req.headers,
    body: req.body,
  };

  Logger.error(`404 Not Found: ${req.originalUrl}`, errorDetails);
  res.status(StatusCodes.NOT_FOUND).json({ 
    success: false,
    message: 'Resource not found',
    code: 'RESOURCE_NOT_FOUND'
  });
};

/**
 * Handles all other uncaught errors
 */
export const errorHandler = (err, req, res, next) => {
  const errorDetails = {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
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

  // Don't expose stack trace in production
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};