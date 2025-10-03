const express = require('express');
const FlightController = require('../../controllers/flight-controller');
const {
  authenticate,
  authorize,
} = require('../../middlewares/auth-middleware');
const {
  flightSearchValidation,
  uuidParamValidation,
  paginationValidation,
} = require('../../middlewares/validation-middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Flight:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         flightNumber:
 *           type: string
 *         airline:
 *           $ref: '#/components/schemas/Airline'
 *         airplane:
 *           $ref: '#/components/schemas/Airplane'
 *         departureAirport:
 *           $ref: '#/components/schemas/Airport'
 *         arrivalAirport:
 *           $ref: '#/components/schemas/Airport'
 *         departureTime:
 *           type: string
 *           format: date-time
 *         arrivalTime:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [scheduled, boarding, departed, in-flight, arrived, delayed, cancelled]
 *         basePrice:
 *           type: number
 *           format: decimal
 *         availableSeats:
 *           type: integer
 *         totalSeats:
 *           type: integer
 *         duration:
 *           type: integer
 *           description: Flight duration in minutes
 *         formattedDuration:
 *           type: string
 *           description: Formatted duration (e.g., "2h 30m")
 *         pricing:
 *           type: object
 *           properties:
 *             economy:
 *               type: number
 *             premiumEconomy:
 *               type: number
 *             business:
 *               type: number
 *             first:
 *               type: number
 *
 *     Airport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         iataCode:
 *           type: string
 *           description: 3-letter IATA code
 *         city:
 *           type: string
 *         country:
 *           type: string
 *
 *     Airline:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         code:
 *           type: string
 *           description: 2-3 letter airline code
 *         country:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/flights/search:
 *   get:
 *     summary: Search for flights
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *         description: Departure airport IATA code
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *         description: Arrival airport IATA code
 *       - in: query
 *         name: departureDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Departure date (YYYY-MM-DD)
 *       - in: query
 *         name: returnDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Return date for round trip
 *       - in: query
 *         name: passengers
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 9
 *           default: 1
 *         description: Number of passengers
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *           enum: [economy, premium-economy, business, first]
 *           default: economy
 *         description: Flight class
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, duration, departure, arrival, airline]
 *           default: price
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: airlines
 *         schema:
 *           type: string
 *         description: Comma-separated list of preferred airline codes
 *     responses:
 *       200:
 *         description: Flights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     flights:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Flight'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/search', flightSearchValidation, FlightController.searchFlights);

/**
 * @swagger
 * /api/v1/flights/{id}:
 *   get:
 *     summary: Get flight by ID
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Flight ID
 *       - in: query
 *         name: includeSeats
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include available seats in response
 *     responses:
 *       200:
 *         description: Flight retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     flight:
 *                       $ref: '#/components/schemas/Flight'
 */
router.get('/:id', uuidParamValidation('id'), FlightController.getFlightById);

/**
 * @swagger
 * /api/v1/flights/{id}/seats:
 *   get:
 *     summary: Get available seats for a flight
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Flight ID
 *       - in: query
 *         name: seatClass
 *         schema:
 *           type: string
 *           enum: [economy, premium-economy, business, first]
 *         description: Filter by seat class
 *     responses:
 *       200:
 *         description: Available seats retrieved successfully
 */
router.get(
  '/:id/seats',
  uuidParamValidation('id'),
  FlightController.getAvailableSeats,
);

/**
 * @swagger
 * /api/v1/flights/route/{from}/{to}:
 *   get:
 *     summary: Get flights by route
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *         description: Departure airport IATA code
 *       - in: path
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *         description: Arrival airport IATA code
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for search
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for search
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Route flights retrieved successfully
 */
router.get('/route/:from/:to', FlightController.getFlightsByRoute);

// Admin/Agent only routes
/**
 * @swagger
 * /api/v1/flights:
 *   post:
 *     summary: Create a new flight (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flightNumber
 *               - airlineId
 *               - airplaneId
 *               - departureAirportId
 *               - arrivalAirportId
 *               - departureTime
 *               - arrivalTime
 *               - basePrice
 *             properties:
 *               flightNumber:
 *                 type: string
 *               airlineId:
 *                 type: string
 *                 format: uuid
 *               airplaneId:
 *                 type: string
 *                 format: uuid
 *               departureAirportId:
 *                 type: string
 *                 format: uuid
 *               arrivalAirportId:
 *                 type: string
 *                 format: uuid
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *               basePrice:
 *                 type: number
 *               gate:
 *                 type: string
 *               terminal:
 *                 type: string
 *     responses:
 *       201:
 *         description: Flight created successfully
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  FlightController.createFlight,
);

/**
 * @swagger
 * /api/v1/flights/{id}:
 *   put:
 *     summary: Update flight (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Flight updated successfully
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  uuidParamValidation('id'),
  FlightController.updateFlight,
);

/**
 * @swagger
 * /api/v1/flights/{id}/status:
 *   patch:
 *     summary: Update flight status (Admin/Agent only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, boarding, departed, in-flight, arrived, delayed, cancelled]
 *               reason:
 *                 type: string
 *                 description: Reason for delay or cancellation
 *     responses:
 *       200:
 *         description: Flight status updated successfully
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'agent'),
  uuidParamValidation('id'),
  FlightController.updateFlightStatus,
);

module.exports = router;
