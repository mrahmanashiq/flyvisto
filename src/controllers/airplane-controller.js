const { AirplaneService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { ErrorResponse, SuccessResponse } = require('../utils/common');

async function createAirplane(req, res) {
    try {
        const airplaneData = req.body;
        const airplane = await AirplaneService.createAirplane(airplaneData);
        res.status(StatusCodes.CREATED)
        .json(SuccessResponse.createSuccessResponse({
            message: 'Airplane created successfully',
            code: 'AIRPLANE_CREATED',
            data: airplane
        }));
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse.createErrorResponse({
            message: 'Something went wrong while creating the airplane',
            errors: error.errors || error
        }));
    }
}

module.exports = {
    createAirplane
};