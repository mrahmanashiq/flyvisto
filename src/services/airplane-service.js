const { AirplaneRepository } = require('../repositories/airplane-repository');
const { ServiceHandler } = require('../utils/common');

const airplaneRepository = new AirplaneRepository();

const createAirplane = ServiceHandler.serviceErrorHandler(async (data) => {
  return await airplaneRepository.create(data);
});

const getAirplanes = ServiceHandler.serviceErrorHandler(async () => {
  return await airplaneRepository.getAll();
});

const getAirplaneById = ServiceHandler.serviceErrorHandler(async (id) => {
  const airplane = await airplaneRepository.get(id);
  return ServiceHandler.ensureResourceExists(airplane, 'Airplane not found');
});

module.exports = {
  createAirplane,
  getAirplanes,
  getAirplaneById,
};
