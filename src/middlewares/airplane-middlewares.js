const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');

function validateCreateAndUpdateAirplane(req, res, next) {
  const { name, modelNumber, capacity } = req.body;
  const error = {
    errors: [],
    message: 'Validation failed.',
    code: 'VALIDATION_ERROR'
  };

//   if (!name) {
//     errors.push({ field: 'name', message: 'Name is required.' });
//   } else if (typeof name !== 'string') {
//     errors.push({ field: 'name', message: 'Name must be a string.' });
//   }

  if (!modelNumber) {
    error.errors.push({ field: 'modelNumber', message: 'Model number is required.', code: 'MODEL_NUMBER_REQUIRED' });
  } else if (typeof modelNumber !== 'string') {
    error.errors.push({ field: 'modelNumber', message: 'Model number must be a string.', code: 'INVALID_VALUE' });
  }

  if (capacity === undefined || capacity === null) {
    error.errors.push({ field: 'capacity', message: 'Capacity is required.', code: 'CAPACITY_REQUIRED' });
  } else if (typeof capacity !== 'number' || capacity <= 0) {
    error.errors.push({ field: 'capacity', message: 'Capacity must be a positive number.', code: 'INVALID_VALUE' });
  }

  if (error.errors.length > 0) {
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse.createErrorResponse({ error }));
  }

  next();
}

module.exports = {
  validateCreateAndUpdateAirplane,
};
