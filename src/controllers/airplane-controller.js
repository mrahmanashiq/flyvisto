const { AirplaneService } = require('../services');
const { StatusCodes } = require('http-status-codes');

async function createAirplane(req, res) {
    try {
        const airplaneData = req.body;
        const airplane = await AirplaneService.createAirplane(airplaneData);
        res.status(StatusCodes.CREATED)
        .json({
            success: true,
            message: 'Airplane created successfully',
            data: airplane,
            error: {}
        });
    } catch (error) {
        console.error('Error creating airplane:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Something went wrong while creating the airplane',
            data: null,
            error: error
        });
    }
}

module.exports = {
    createAirplane
};