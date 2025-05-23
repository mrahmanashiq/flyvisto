function createErrorResponse({ message, code, errors = [], data = {} }) {
  const sanitizedErrors = Array.isArray(errors)
    ? errors.map(err => ({
        field: err.path || err.field,
        message: err.message,
        code: err.validatorKey?.toUpperCase() || 'UNKNOWN_ERROR'
      }))
    : [{ message: String(errors) }];

  const response = {
    success: false,
    message: message || 'Unexpected error occurred',
    code: code || 'INTERNAL_SERVER_ERROR',
    errors: sanitizedErrors,
    data
  };

  if (process.env.NODE_ENV === 'development' && errors?.stack) {
    response.stack = errors.stack;
  }

  return response;
}

module.exports = {
  createErrorResponse
};
