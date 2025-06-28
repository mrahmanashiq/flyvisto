class BaseError extends Error {
  constructor(
    message,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    explanation = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.explanation = Array.isArray(explanation)
      ? explanation
      : [{ message: explanation }];
  }
}

class ValidationError extends BaseError {
  constructor(explanation) {
    super('Validation failed', 400, 'VALIDATION_ERROR', explanation);
  }
}

class NotFoundError extends BaseError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'RESOURCE_NOT_FOUND');
  }
}

module.exports = {
  BaseError,
  ValidationError,
  NotFoundError,
};
