const { AirplaneRepository } = require('../repositories/airplane-repository');
const { ServiceHandler } = require('../utils/common');

const airplaneRepository = new AirplaneRepository();

const createAirplane = ServiceHandler.serviceErrorHandler(async (data) => {
  return await airplaneRepository.create(data);
}, 'AirplaneService.createAirplane');

const getAirplanes = ServiceHandler.serviceErrorHandler(async () => {
  return await airplaneRepository.getAll();
}, 'AirplaneService.getAirplanes');

const getAirplaneById = ServiceHandler.serviceErrorHandler(async (id) => {
  const airplane = await airplaneRepository.get(id);
  return ServiceHandler.ensureResourceExists(airplane, 'Airplane not found', {
    resourceType: 'Airplane',
    resourceId: id,
    operation: 'getById',
  });
}, 'AirplaneService.getAirplaneById');

const deleteAirplane = ServiceHandler.serviceErrorHandler(async (id) => {
  const airplane = await airplaneRepository.get(id);
  ServiceHandler.ensureResourceExists(airplane, 'Airplane not found', {
    resourceType: 'Airplane',
    resourceId: id,
    operation: 'delete',
  });
  return await airplaneRepository.delete(id);
}, 'AirplaneService.deleteAirplane');

const updateAirplane = ServiceHandler.serviceErrorHandler(async (id, data) => {
  const airplane = await airplaneRepository.get(id);
  ServiceHandler.ensureResourceExists(airplane, 'Airplane not found', {
    resourceType: 'Airplane',
    resourceId: id,
    operation: 'update',
  });
  await airplaneRepository.update(id, data);
  return await airplaneRepository.get(id);
}, 'AirplaneService.updateAirplane');

module.exports = {
  createAirplane,
  getAirplanes,
  getAirplaneById,
  deleteAirplane,
  updateAirplane,
};
