const { StatusCodes } = require('http-status-codes');
const AuthService = require('../services/auth-service');
const { ErrorResponse } = require('../utils/common');
const {
  AuthenticationError,
  AuthorizationError,
} = require('../utils/errors/custom-errors');

// Middleware to authenticate JWT token
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await AuthService.getUserByToken(token);

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ErrorResponse.createErrorResponse({ error }));
  }
}

// Middleware to check if user has required role
function authorize(...roles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new AuthorizationError('Insufficient permissions');
      }

      next();
    } catch (error) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  };
}

// Middleware for optional authentication (doesn't fail if no token)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await AuthService.getUserByToken(token);
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

// Middleware to check if user is verified
function requireVerification(req, res, next) {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!req.user.isEmailVerified) {
      throw new AuthorizationError('Email verification required');
    }

    next();
  } catch (error) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(ErrorResponse.createErrorResponse({ error }));
  }
}

// Middleware to check if user owns the resource
function requireOwnership(resourceIdParam = 'id', userIdField = 'userId') {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // If user is admin, allow access
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if resource belongs to user
      // This will need to be customized based on the specific resource
      if (req.resource && req.resource[userIdField] !== userId) {
        throw new AuthorizationError('Access denied');
      }

      next();
    } catch (error) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  };
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requireVerification,
  requireOwnership,
};
