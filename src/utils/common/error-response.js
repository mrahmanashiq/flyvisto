const { Logger } = require('../../config');
const requestContext = require('../common/request-context');

function createErrorResponse({ error }) {
  const correlationId = requestContext.getRequestContext().correlationId || null;

  const sanitizedErrors = Array.isArray(error?.explanation || error?.errors)
    ? (error.explanation || error.errors).map(err => ({
        field: err.path || err.field,
        message: err.message,
        code: err.code || err.validatorKey?.toUpperCase() || 'UNKNOWN_ERROR'
      }))
    : [{ message: error.message || String(error) }];

  const response = {
    success: false,
    message: error.message || 'Unexpected error occurred',
    code: error.code || 'INTERNAL_SERVER_ERROR',
    errors: sanitizedErrors,
    data: error.data || {}
  };

  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_LOG === 'true') {
    response.stack = error.stack;
  }

  Logger.error('Error Response', {
    correlationId,
    message: response.message,
    code: response.code,
    errors: response.errors,
    stack: response.stack
  });

  return response;
}

module.exports = {
  createErrorResponse
};
