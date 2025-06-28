const { ValidationError, NotFoundError } = require('../errors/custom-errors');
const { Logger } = require('../../config');

/**
 * Higher-order function to wrap service methods with standardized error handling
 * @param {Function} serviceMethod - The service method to wrap
 * @returns {Function} - Wrapped service method with error handling
 */
const serviceErrorHandler = (serviceMethod) => {
  return async (...args) => {
    try {
      const result = await serviceMethod(...args);
      
      // Log successful service operation (debug level)
      Logger.debug('Service operation completed successfully', {
        serviceName: serviceMethod.name || 'anonymous',
        argsCount: args.length,
      });
      
      return result;
    } catch (error) {
      // Log the original error for debugging
      Logger.error(`Service error in ${serviceMethod.name || 'anonymous service'}`, {
        errorName: error.name,
        errorMessage: error.message,
        serviceName: serviceMethod.name || 'anonymous',
        errorCode: error.code || 'UNKNOWN_ERROR',
        stack: error.stack,
      });
      
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const explanation = error.errors.map((err) => ({
          message: err.message,
          field: err.path,
        }));
        
        Logger.warn('Validation error occurred', {
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
        
        Logger.warn('Unique constraint violation', {
          errorCode: 'UNIQUE_CONSTRAINT_ERROR',
          constraintErrors: explanation,
        });
        
        throw new ValidationError(explanation);
      }
      
      // Re-throw custom errors as-is (already logged above)
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      // Handle any other errors
      Logger.error('Unexpected service error', {
        errorCode: 'UNEXPECTED_SERVICE_ERROR',
        errorName: error.name,
        errorMessage: error.message,
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
    // Log the not found scenario with context
    Logger.warn(`Resource not found: ${message}`, {
      message,
      searchContext: context,
      errorCode: 'RESOURCE_NOT_FOUND',
    });
    
    throw new NotFoundError(message);
  }
  
  // Log successful resource retrieval (debug level)
  Logger.debug(`Resource found successfully`, {
    message: 'Resource retrieved',
    resourceType: context.resourceType || 'unknown',
    resourceId: context.resourceId || 'unknown',
  });
  
  return resource;
};

module.exports = {
  serviceErrorHandler,
  ensureResourceExists,
};
