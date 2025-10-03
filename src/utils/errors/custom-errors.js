const { StatusCodes } = require('http-status-codes');

class BaseError extends Error {
  constructor(message, statusCode, code = null, errors = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends BaseError {
  constructor(errors = [], message = 'Validation failed') {
    super(message, StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR', errors);
  }
}

class AuthenticationError extends BaseError {
  constructor(message = 'Authentication failed') {
    super(message, StatusCodes.UNAUTHORIZED, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends BaseError {
  constructor(message = 'Access denied') {
    super(message, StatusCodes.FORBIDDEN, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends BaseError {
  constructor(message = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND, 'NOT_FOUND');
  }
}

class ConflictError extends BaseError {
  constructor(message = 'Resource conflict') {
    super(message, StatusCodes.CONFLICT, 'CONFLICT');
  }
}

class BadRequestError extends BaseError {
  constructor(message = 'Bad request') {
    super(message, StatusCodes.BAD_REQUEST, 'BAD_REQUEST');
  }
}

class InternalServerError extends BaseError {
  constructor(message = 'Internal server error') {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR');
  }
}

class PaymentError extends BaseError {
  constructor(message = 'Payment processing failed') {
    super(message, StatusCodes.PAYMENT_REQUIRED, 'PAYMENT_ERROR');
  }
}

class ServiceUnavailableError extends BaseError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, StatusCodes.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE');
  }
}

class RateLimitError extends BaseError {
  constructor(message = 'Rate limit exceeded') {
    super(message, StatusCodes.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED');
  }
}

module.exports = {
  BaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  InternalServerError,
  PaymentError,
  ServiceUnavailableError,
  RateLimitError,
};
