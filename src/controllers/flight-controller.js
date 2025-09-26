const { StatusCodes } = require('http-status-codes');
const FlightService = require('../services/flight-service');
const { ErrorResponse, SuccessResponse } = require('../utils/common');

class FlightController {
  // Search flights
  async searchFlights(req, res) {
    try {
      const searchParams = {
        from: req.query.from,
        to: req.query.to,
        departureDate: req.query.departureDate,
        returnDate: req.query.returnDate,
        passengers: parseInt(req.query.passengers) || 1,
        flightClass: req.query.class || 'economy',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sortBy: req.query.sortBy || 'price',
        sortOrder: req.query.sortOrder || 'asc',
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        preferredAirlines: req.query.airlines ? req.query.airlines.split(',') : null,
        maxStops: parseInt(req.query.maxStops) || 0,
        departureTimeRange: req.query.departureTimeRange ? JSON.parse(req.query.departureTimeRange) : null,
        arrivalTimeRange: req.query.arrivalTimeRange ? JSON.parse(req.query.arrivalTimeRange) : null,
      };

      const result = await FlightService.searchFlights(searchParams);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Flights retrieved successfully',
          code: 'FLIGHTS_RETRIEVED',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Get flight by ID
  async getFlightById(req, res) {
    try {
      const { id } = req.params;
      const includeSeats = req.query.includeSeats === 'true';
      
      const flight = await FlightService.getFlightById(id, includeSeats);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Flight retrieved successfully',
          code: 'FLIGHT_RETRIEVED',
          data: { flight },
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Get available seats for a flight
  async getAvailableSeats(req, res) {
    try {
      const { id } = req.params;
      const { seatClass } = req.query;
      
      const seats = await FlightService.getAvailableSeats(id, seatClass);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Available seats retrieved successfully',
          code: 'SEATS_RETRIEVED',
          data: { seats },
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Create new flight (Admin only)
  async createFlight(req, res) {
    try {
      const flightData = req.body;
      const flight = await FlightService.createFlight(flightData);

      res.status(StatusCodes.CREATED).json(
        SuccessResponse.createSuccessResponse({
          message: 'Flight created successfully',
          code: 'FLIGHT_CREATED',
          data: { flight },
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Update flight (Admin only)
  async updateFlight(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const flight = await FlightService.updateFlight(id, updateData);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Flight updated successfully',
          code: 'FLIGHT_UPDATED',
          data: { flight },
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Update flight status (Admin/Agent only)
  async updateFlightStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      
      const flight = await FlightService.updateFlightStatus(id, status, reason);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Flight status updated successfully',
          code: 'FLIGHT_STATUS_UPDATED',
          data: { flight },
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Get flights by route (popular routes)
  async getFlightsByRoute(req, res) {
    try {
      const { from, to } = req.params;
      const {
        startDate = new Date().toISOString().split('T')[0],
        endDate = null,
        limit = 10
      } = req.query;

      const searchParams = {
        from,
        to,
        departureDate: startDate,
        returnDate: endDate,
        limit: parseInt(limit),
        sortBy: 'departureTime',
        sortOrder: 'asc'
      };

      const result = await FlightService.searchFlights(searchParams);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Route flights retrieved successfully',
          code: 'ROUTE_FLIGHTS_RETRIEVED',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }
}

module.exports = new FlightController();
