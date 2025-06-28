const { AirplaneService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { ResponseHandler } = require('../utils/common');

const createAirplane = ResponseHandler.asyncHandler(async (req, res) => {
  const airplaneData = req.body;
  const airplane = await AirplaneService.createAirplane(airplaneData);
  
  ResponseHandler.sendSuccessResponse(res, {
    message: 'Airplane created successfully',
    code: 'AIRPLANE_CREATED',
    data: airplane,
    statusCode: StatusCodes.CREATED,
  });
});

const getAirplanes = ResponseHandler.asyncHandler(async (req, res) => {
  const airplanes = await AirplaneService.getAirplanes();
  
  ResponseHandler.sendSuccessResponse(res, {
    message: 'Airplanes retrieved successfully',
    code: 'AIRPLANES_RETRIEVED',
    data: airplanes,
  });
});

const getAirplane = ResponseHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const airplane = await AirplaneService.getAirplaneById(id);
  
  ResponseHandler.sendSuccessResponse(res, {
    message: 'Airplane retrieved successfully',
    code: 'AIRPLANE_RETRIEVED',
    data: airplane,
  });
});

const deleteAirplane = ResponseHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  await AirplaneService.deleteAirplane(id);
  
  ResponseHandler.sendSuccessResponse(res, {
    message: 'Airplane deleted successfully',
    code: 'AIRPLANE_DELETED',
  });
});

const updateAirplane = ResponseHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const airplaneData = req.body;
  const airplane = await AirplaneService.updateAirplane(id, airplaneData);
  
  ResponseHandler.sendSuccessResponse(res, {
    message: 'Airplane updated successfully',
    code: 'AIRPLANE_UPDATED',
    data: airplane,
  });
});

module.exports = {
  createAirplane,
  getAirplanes,
  getAirplane,
  deleteAirplane,
  updateAirplane,
};
