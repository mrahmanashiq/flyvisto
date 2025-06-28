const { ValidationError, NotFoundError } = require('../errors/custom-errors');

/**
 * Higher-order function to wrap service methods with standardized error handling
 * @param {Function} serviceMethod - The service method to wrap
 * @returns {Function} - Wrapped service method with error handling
 */
const serviceErrorHandler = (serviceMethod) => {
  return async (...args) => {
    try {
      return await serviceMethod(...args);
    } catch (error) {
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const explanation = error.errors.map((err) => ({
          message: err.message,
          field: err.path,
        }));
        throw new ValidationError(explanation);
      }
      
      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        const explanation = error.errors.map((err) => ({
          message: `${err.path} must be unique`,
          field: err.path,
        }));
        throw new ValidationError(explanation);
      }
      
      // Re-throw custom errors as-is
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      // Handle any other errors
      throw error;
    }
  };
};

/**
 * Helper function to handle "not found" scenarios
 * @param {any} resource - The resource to check
 * @param {string} message - Custom not found message
 * @returns {any} - Returns the resource if found
 * @throws {NotFoundError} - If resource is null/undefined
 */
const ensureResourceExists = (resource, message = 'Resource not found') => {
  if (!resource) {
    throw new NotFoundError(message);
  }
  return resource;
};

module.exports = {
  serviceErrorHandler,
  ensureResourceExists,
};
