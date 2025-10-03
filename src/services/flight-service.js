const { Op } = require('sequelize');
const { Flight, Airport, Airline, Airplane, Seat } = require('../models');
const {
  NotFoundError,
  ValidationError,
} = require('../utils/errors/custom-errors');
const moment = require('moment');

class FlightService {
  // Search flights with filters
  async searchFlights(searchParams) {
    const {
      from,
      to,
      departureDate,
      returnDate,
      passengers = 1,
      flightClass = 'economy',
      page = 1,
      limit = 20,
      sortBy = 'price',
      sortOrder = 'asc',
      maxPrice,
      minPrice,
      preferredAirlines,
      maxStops = 0,
      departureTimeRange,
      arrivalTimeRange,
    } = searchParams;

    // Build where conditions
    const whereConditions = {
      isActive: true,
      status: ['scheduled', 'boarding'],
      availableSeats: { [Op.gte]: passengers },
    };

    // Date filters
    if (departureDate) {
      const startOfDay = moment(departureDate).startOf('day').toDate();
      const endOfDay = moment(departureDate).endOf('day').toDate();
      whereConditions.departureTime = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    // Price filters
    if (maxPrice) {
      whereConditions.basePrice = { [Op.lte]: maxPrice };
    }
    if (minPrice) {
      whereConditions.basePrice = {
        ...whereConditions.basePrice,
        [Op.gte]: minPrice,
      };
    }

    // Time range filters
    if (departureTimeRange) {
      const { start, end } = departureTimeRange;
      whereConditions[Op.and] = [
        {
          departureTime: { [Op.gte]: moment().hour(start).minute(0).toDate() },
        },
        { departureTime: { [Op.lte]: moment().hour(end).minute(59).toDate() } },
      ];
    }

    // Include filters
    const include = [
      {
        model: Airport,
        as: 'departureAirport',
        where: from ? { iataCode: from.toUpperCase() } : {},
      },
      {
        model: Airport,
        as: 'arrivalAirport',
        where: to ? { iataCode: to.toUpperCase() } : {},
      },
      {
        model: Airline,
        as: 'airline',
        where: preferredAirlines
          ? { code: { [Op.in]: preferredAirlines } }
          : {},
      },
      {
        model: Airplane,
        as: 'airplane',
      },
    ];

    // Sorting
    let order = [];
    switch (sortBy) {
      case 'price':
        order = [['basePrice', sortOrder]];
        break;
      case 'duration':
        order = [['departureTime', sortOrder]];
        break;
      case 'departure':
        order = [['departureTime', sortOrder]];
        break;
      case 'arrival':
        order = [['arrivalTime', sortOrder]];
        break;
      case 'airline':
        order = [[{ model: Airline, as: 'airline' }, 'name', sortOrder]];
        break;
      default:
        order = [['departureTime', 'asc']];
    }

    // Pagination
    const offset = (page - 1) * limit;

    const { rows: flights, count } = await Flight.findAndCountAll({
      where: whereConditions,
      include,
      order,
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    // Calculate additional data for each flight
    const enrichedFlights = flights.map((flight) => {
      const flightData = flight.toJSON();

      // Calculate duration
      const duration = moment(flight.arrivalTime).diff(
        moment(flight.departureTime),
        'minutes',
      );
      flightData.duration = duration;
      flightData.formattedDuration = this.formatDuration(duration);

      // Calculate pricing for different classes
      flightData.pricing = this.calculateClassPricing(
        flight.basePrice,
        flightClass,
      );

      // Add availability info
      flightData.availability = {
        total: flight.totalSeats,
        available: flight.availableSeats,
        percentage: Math.round(
          (flight.availableSeats / flight.totalSeats) * 100,
        ),
      };

      return flightData;
    });

    return {
      flights: enrichedFlights,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
      filters: {
        from,
        to,
        departureDate,
        passengers,
        flightClass,
      },
    };
  }

  // Get flight by ID with full details
  async getFlightById(flightId, includeSeats = false) {
    const include = [
      {
        model: Airport,
        as: 'departureAirport',
      },
      {
        model: Airport,
        as: 'arrivalAirport',
      },
      {
        model: Airline,
        as: 'airline',
      },
      {
        model: Airplane,
        as: 'airplane',
      },
    ];

    if (includeSeats) {
      include.push({
        model: Seat,
        as: 'seats',
        where: { isAvailable: true },
        required: false,
      });
    }

    const flight = await Flight.findByPk(flightId, { include });

    if (!flight) {
      throw new NotFoundError('Flight not found');
    }

    const flightData = flight.toJSON();

    // Calculate duration
    const duration = moment(flight.arrivalTime).diff(
      moment(flight.departureTime),
      'minutes',
    );
    flightData.duration = duration;
    flightData.formattedDuration = this.formatDuration(duration);

    // Calculate pricing for different classes
    flightData.pricing = {
      economy: flight.basePrice,
      premiumEconomy: flight.basePrice * 1.3,
      business: flight.basePrice * 2.5,
      first: flight.basePrice * 4,
    };

    // Group seats by class if included
    if (includeSeats && flight.seats) {
      flightData.seatMap = this.groupSeatsByClass(flight.seats);
    }

    return flightData;
  }

  // Get available seats for a flight
  async getAvailableSeats(flightId, seatClass = null) {
    const whereCondition = {
      flightId,
      isAvailable: true,
      isBlocked: false,
    };

    if (seatClass) {
      whereCondition.seatClass = seatClass;
    }

    const seats = await Seat.findAll({
      where: whereCondition,
      order: [
        ['row', 'asc'],
        ['column', 'asc'],
      ],
    });

    return this.groupSeatsByClass(seats);
  }

  // Create a new flight
  async createFlight(flightData) {
    const {
      flightNumber,
      airlineId,
      airplaneId,
      departureAirportId,
      arrivalAirportId,
      departureTime,
      arrivalTime,
      basePrice,
      gate,
      terminal,
    } = flightData;

    // Validate that airports are different
    if (departureAirportId === arrivalAirportId) {
      throw new ValidationError([
        {
          field: 'arrivalAirportId',
          message: 'Arrival airport must be different from departure airport',
          code: 'SAME_AIRPORTS',
        },
      ]);
    }

    // Validate that arrival time is after departure time
    if (new Date(arrivalTime) <= new Date(departureTime)) {
      throw new ValidationError([
        {
          field: 'arrivalTime',
          message: 'Arrival time must be after departure time',
          code: 'INVALID_TIME_SEQUENCE',
        },
      ]);
    }

    // Get airplane capacity
    const airplane = await Airplane.findByPk(airplaneId);
    if (!airplane) {
      throw new ValidationError([
        {
          field: 'airplaneId',
          message: 'Airplane not found',
          code: 'AIRPLANE_NOT_FOUND',
        },
      ]);
    }

    const flight = await Flight.create({
      flightNumber,
      airlineId,
      airplaneId,
      departureAirportId,
      arrivalAirportId,
      departureTime,
      arrivalTime,
      basePrice,
      gate,
      terminal,
      totalSeats: airplane.capacity,
      availableSeats: airplane.capacity,
    });

    // Generate seats for the flight
    await this.generateSeatsForFlight(flight.id, airplane);

    return this.getFlightById(flight.id);
  }

  // Update flight
  async updateFlight(flightId, updateData) {
    const flight = await Flight.findByPk(flightId);

    if (!flight) {
      throw new NotFoundError('Flight not found');
    }

    // Validate updates that affect existing bookings
    if (updateData.departureTime || updateData.arrivalTime) {
      // Check if there are existing bookings
      const bookingCount = await flight.countBookings();
      if (bookingCount > 0) {
        // Only allow minor time adjustments (up to 2 hours)
        const timeDiff = Math.abs(
          new Date(updateData.departureTime || flight.departureTime) -
            new Date(flight.departureTime),
        );

        if (timeDiff > 2 * 60 * 60 * 1000) {
          // 2 hours in milliseconds
          throw new ValidationError([
            {
              field: 'departureTime',
              message:
                'Cannot change departure time by more than 2 hours when bookings exist',
              code: 'TIME_CHANGE_RESTRICTED',
            },
          ]);
        }
      }
    }

    await flight.update(updateData);
    return this.getFlightById(flightId);
  }

  // Update flight status
  async updateFlightStatus(flightId, status, reason = null) {
    const flight = await Flight.findByPk(flightId);

    if (!flight) {
      throw new NotFoundError('Flight not found');
    }

    const updateData = { status };

    if (status === 'delayed' && reason) {
      updateData.delayReason = reason;
    }

    if (status === 'departed') {
      updateData.actualDepartureTime = new Date();
    }

    if (status === 'arrived') {
      updateData.actualArrivalTime = new Date();
    }

    await flight.update(updateData);

    // TODO: Send notifications to passengers about status change
    // await NotificationService.sendFlightStatusUpdate(flightId, status);

    return this.getFlightById(flightId);
  }

  // Helper methods
  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  calculateClassPricing(basePrice, requestedClass = 'economy') {
    const multipliers = {
      economy: 1,
      'premium-economy': 1.3,
      business: 2.5,
      first: 4,
    };

    const pricing = {};
    Object.keys(multipliers).forEach((seatClass) => {
      pricing[seatClass] =
        Math.round(basePrice * multipliers[seatClass] * 100) / 100;
    });

    return pricing;
  }

  groupSeatsByClass(seats) {
    const seatMap = {
      economy: [],
      premiumEconomy: [],
      business: [],
      first: [],
    };

    seats.forEach((seat) => {
      const seatClass =
        seat.seatClass === 'premium-economy'
          ? 'premiumEconomy'
          : seat.seatClass;
      if (seatMap[seatClass]) {
        seatMap[seatClass].push(seat);
      }
    });

    return seatMap;
  }

  async generateSeatsForFlight(flightId, airplane) {
    const seatConfiguration = airplane.seatConfiguration || {
      economy: airplane.capacity,
      premiumEconomy: 0,
      business: 0,
      first: 0,
    };

    const seats = [];
    let currentRow = 1;

    // Generate seats by class
    for (const [seatClass, count] of Object.entries(seatConfiguration)) {
      if (count > 0) {
        const seatsPerRow =
          seatClass === 'first' ? 4 : seatClass === 'business' ? 4 : 6;
        const rows = Math.ceil(count / seatsPerRow);

        for (let row = 0; row < rows; row++) {
          const columns = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, seatsPerRow);

          columns.forEach((column, colIndex) => {
            if (seats.length < count) {
              const seatNumber = `${currentRow}${column}`;
              let seatType = 'middle';

              if (colIndex === 0 || colIndex === seatsPerRow - 1) {
                seatType = 'window';
              } else if (
                colIndex === Math.floor(seatsPerRow / 2) - 1 ||
                colIndex === Math.floor(seatsPerRow / 2)
              ) {
                seatType = 'aisle';
              }

              seats.push({
                flightId,
                seatNumber,
                row: currentRow,
                column,
                seatClass:
                  seatClass === 'premiumEconomy'
                    ? 'premium-economy'
                    : seatClass,
                seatType,
                basePrice: this.calculateSeatPrice(seatClass, seatType),
              });
            }
          });

          currentRow++;
        }
      }
    }

    await Seat.bulkCreate(seats);
  }

  calculateSeatPrice(seatClass, seatType) {
    const basePrices = {
      economy: 0,
      premiumEconomy: 30,
      business: 100,
      first: 200,
    };

    const typeMultipliers = {
      window: 1.2,
      aisle: 1.1,
      middle: 1,
    };

    const basePrice =
      basePrices[
        seatClass === 'premium-economy' ? 'premiumEconomy' : seatClass
      ] || 0;
    return Math.round(basePrice * typeMultipliers[seatType] * 100) / 100;
  }
}

module.exports = new FlightService();
