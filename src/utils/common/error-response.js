const { Logger } = require('../../config');
const requestContext = require('../common/request-context');

function createErrorResponse({ error }) {
  const correlationId =
    requestContext.getRequestContext().correlationId || null;

  const sanitizedErrors = Array.isArray(error?.explanation || error?.errors)
    ? (error.explanation || error.errors).map((err) => ({
        field: err.path || err.field,
        message: err.message,
        code: err.code || err.validatorKey?.toUpperCase() || 'UNKNOWN_ERROR',
      }))
    : [{ message: error.message || String(error) }];

  const response = {
    success: false,
    message: error.message || 'Unexpected error occurred',
    code: error.code || 'INTERNAL_SERVER_ERROR',
    errors: sanitizedErrors,
    data: error.data || {},
  };

  // Only add stack trace for unexpected errors and in development
  if (
    (process.env.NODE_ENV === 'development' || process.env.DEBUG_LOG === 'true') &&
    error.code !== 'RESOURCE_NOT_FOUND' &&
    error.code !== 'VALIDATION_ERROR'
  ) {
    response.stack = error.stack;
  }

  // Don't log error responses here - let HTTP middleware handle the final logging
  // This avoids duplicate logs and keeps it clean

  return response;
}

module.exports = {
  createErrorResponse,
};
