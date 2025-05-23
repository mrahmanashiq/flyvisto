const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');

function validateCreateAndUpdateAirplane(req, res, next) {
  const { name, modelNumber, capacity } = req.body;
  const errors = [];

//   if (!name) {
//     errors.push({ field: 'name', message: 'Name is required.' });
//   } else if (typeof name !== 'string') {
//     errors.push({ field: 'name', message: 'Name must be a string.' });
//   }

  if (!modelNumber) {
    errors.push({ field: 'modelNumber', message: 'Model is required.', code: 'MODEL_REQUIRED' });
  } else if (typeof modelNumber !== 'string') {
    errors.push({ field: 'modelNumber', message: 'Model must be a string.', code: 'INVALID_VALUE' });
  }

  if (capacity === undefined || capacity === null) {
    errors.push({ field: 'capacity', message: 'Capacity is required.', code: 'CAPACITY_REQUIRED' });
  } else if (typeof capacity !== 'number' || capacity <= 0) {
    errors.push({ field: 'capacity', message: 'Capacity must be a positive number.', code: 'INVALID_VALUE' });
  }

  if (errors.length > 0) {
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse.createErrorResponse({
      message: 'Validation failed.',
      code: 'VALIDATION_ERROR',
      errors
    }));
  }

  next();
}

module.exports = {
  validateCreateAndUpdateAirplane,
};
