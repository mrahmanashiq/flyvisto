const { ValidationError, NotFoundError } = require('../errors/custom-errors');
const { Logger } = require('../../config');

/**
 * Higher-order function to wrap service methods with standardized error handling
 * @param {Function} serviceMethod - The service method to wrap
 * @param {string} serviceName - Optional name for better logging (recommended)
 * @returns {Function} - Wrapped service method with error handling
 */
const serviceErrorHandler = (serviceMethod, serviceName = null) => {
  return async (...args) => {
    const methodName = serviceName || serviceMethod.name || 'anonymous service';
    
    try {
      const result = await serviceMethod(...args);
      
      // Log successful service operation (debug level)
      Logger.debug('Service operation completed successfully', {
        serviceName: methodName,
        argsCount: args.length,
      });
      
      return result;
    } catch (error) {
      // Don't log expected business errors - let HTTP middleware handle final logging
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const explanation = error.errors.map((err) => ({
          message: err.message,
          field: err.path,
        }));
        
        // Only log complex validation scenarios
        Logger.warn(`Database validation failed in ${methodName}`, {
          serviceName: methodName,
          errorCode: 'VALIDATION_ERROR',
          validationErrors: explanation,
        });
        
        throw new ValidationError(explanation);
      }
      
      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        const explanation = error.errors.map((err) => ({
          message: `${err.path} must be unique`,
          field: err.path,
        }));
        
        Logger.warn(`Unique constraint violation in ${methodName}`, {
          serviceName: methodName,
          errorCode: 'UNIQUE_CONSTRAINT_ERROR',
          constraintErrors: explanation,
        });
        
        throw new ValidationError(explanation);
      }
      
      // Only log real unexpected errors with stack trace
      Logger.error(`Unexpected error in ${methodName}`, {
        serviceName: methodName,
        errorName: error.name,
        errorMessage: error.message,
        errorCode: 'UNEXPECTED_SERVICE_ERROR',
        stack: error.stack,
      });
      
      throw error;
    }
  };
};

/**
 * Helper function to handle "not found" scenarios
 * @param {any} resource - The resource to check
 * @param {string} message - Custom not found message
 * @param {Object} context - Additional context for logging (optional)
 * @returns {any} - Returns the resource if found
 * @throws {NotFoundError} - If resource is null/undefined
 */
const ensureResourceExists = (resource, message = 'Resource not found', context = {}) => {
  if (!resource) {
    // Don't log here - let the HTTP middleware handle the final logging
    throw new NotFoundError(message);
  }
  
  // No logging for successful resource retrieval - too verbose
  return resource;
};

module.exports = {
  serviceErrorHandler,
  ensureResourceExists,
};
