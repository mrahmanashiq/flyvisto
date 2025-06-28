const { AirplaneRepository } = require('../repositories/airplane-repository');
const { ValidationError } = require('../utils/errors/custom-errors');
const { StatusCodes } = require('http-status-codes');

const airplaneRepository = new AirplaneRepository();

async function createAirplane(data) {
  try {
    const airplane = await airplaneRepository.create(data);
    return airplane;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const explanation = error.errors.map((err) => ({
        message: err.message,
      }));
      throw new ValidationError(explanation);
    }
    throw error;
  }
}

module.exports = {
  createAirplane,
};
