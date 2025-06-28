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

module.exports = {
  createAirplane,
  getAirplanes,
};
