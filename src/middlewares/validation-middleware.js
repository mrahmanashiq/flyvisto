const { body, query, param, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      code: 'VALIDATION_ERROR',
      value: error.value,
    }));

    return res.status(StatusCodes.BAD_REQUEST).json(
      ErrorResponse.createErrorResponse({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: formattedErrors,
        }
      })
    );
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors,
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors,
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  handleValidationErrors,
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  handleValidationErrors,
];

const requestPasswordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors,
];

// Flight search validation
const flightSearchValidation = [
  query('from')
    .notEmpty()
    .withMessage('Departure airport is required')
    .isLength({ min: 3, max: 3 })
    .withMessage('Airport code must be 3 characters'),
  
  query('to')
    .notEmpty()
    .withMessage('Arrival airport is required')
    .isLength({ min: 3, max: 3 })
    .withMessage('Airport code must be 3 characters'),
  
  query('departureDate')
    .isISO8601()
    .withMessage('Please provide a valid departure date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error('Departure date cannot be in the past');
      }
      return true;
    }),
  
  query('returnDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid return date')
    .custom((value, { req }) => {
      if (value) {
        const returnDate = new Date(value);
        const departureDate = new Date(req.query.departureDate);
        
        if (returnDate <= departureDate) {
          throw new Error('Return date must be after departure date');
        }
      }
      return true;
    }),
  
  query('passengers')
    .optional()
    .isInt({ min: 1, max: 9 })
    .withMessage('Number of passengers must be between 1 and 9'),
  
  query('class')
    .optional()
    .isIn(['economy', 'premium-economy', 'business', 'first'])
    .withMessage('Invalid flight class'),
  
  handleValidationErrors,
];

// Booking validation
const createBookingValidation = [
  body('flightId')
    .isUUID()
    .withMessage('Valid flight ID is required'),
  
  body('passengers')
    .isArray({ min: 1, max: 9 })
    .withMessage('At least one passenger is required (maximum 9)'),
  
  body('passengers.*.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Passenger first name must be between 2 and 50 characters'),
  
  body('passengers.*.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Passenger last name must be between 2 and 50 characters'),
  
  body('passengers.*.dateOfBirth')
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  
  body('passengers.*.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Valid gender is required'),
  
  body('passengers.*.nationality')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nationality is required'),
  
  body('passengers.*.passportNumber')
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Valid passport number is required'),
  
  body('passengers.*.passportExpiryDate')
    .isISO8601()
    .withMessage('Valid passport expiry date is required')
    .custom((value) => {
      const expiryDate = new Date(value);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      
      if (expiryDate <= sixMonthsFromNow) {
        throw new Error('Passport must be valid for at least 6 months');
      }
      return true;
    }),
  
  body('contactEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid contact email is required'),
  
  body('contactPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors,
];

// UUID parameter validation
const uuidParamValidation = (paramName = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`Valid ${paramName} is required`),
  
  handleValidationErrors,
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort field must be a string'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  changePasswordValidation,
  resetPasswordValidation,
  requestPasswordResetValidation,
  flightSearchValidation,
  createBookingValidation,
  uuidParamValidation,
  paginationValidation,
};
