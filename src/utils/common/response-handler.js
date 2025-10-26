const { StatusCodes } = require('http-status-codes');
const { createErrorResponse } = require('./error-response');
const { createSuccessResponse } = require('./success-response');

/**
 * Sends a success response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {string} options.message - Success message
 * @param {string} options.code - Response code
 * @param {any} options.data - Response data
 * @param {number} [options.statusCode=200] - HTTP status code
 */
const sendSuccessResponse = (res, { message, code, data, statusCode = StatusCodes.OK }) => {
  const successResponse = createSuccessResponse({
    message,
    code,
    data,
  });
  
  return res.status(statusCode).json(successResponse);
};

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
const sendErrorResponse = (res, error) => {
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const errorResponse = createErrorResponse({ error });
  
  return res.status(statusCode).json(errorResponse);
};

/**
 * Higher-order function to wrap async controllers with error handling
 * @param {Function} controller - Async controller function
 * @returns {Function} - Wrapped controller with error handling
 */
const asyncHandler = (controller) => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      // Don't log here - let error response handler or HTTP middleware log once
      sendErrorResponse(res, error);
    }
  };
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  asyncHandler,
};
