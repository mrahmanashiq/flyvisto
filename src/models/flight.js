'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    static associate(models) {
      // Flight belongs to airline
      Flight.belongsTo(models.Airline, {
        foreignKey: 'airlineId',
        as: 'airline',
      });

      // Flight belongs to airplane
      Flight.belongsTo(models.Airplane, {
        foreignKey: 'airplaneId',
        as: 'airplane',
      });

      // Flight belongs to departure airport
      Flight.belongsTo(models.Airport, {
        foreignKey: 'departureAirportId',
        as: 'departureAirport',
      });

      // Flight belongs to arrival airport
      Flight.belongsTo(models.Airport, {
        foreignKey: 'arrivalAirportId',
        as: 'arrivalAirport',
      });

      // Flight has many bookings
      Flight.hasMany(models.Booking, {
        foreignKey: 'flightId',
        as: 'bookings',
      });

      // Flight has many seats
      Flight.hasMany(models.Seat, {
        foreignKey: 'flightId',
        as: 'seats',
      });
    }

    // Instance methods
    getAvailableSeats() {
      return this.seats ? this.seats.filter(seat => seat.isAvailable) : [];
    }

    getDuration() {
      if (this.departureTime && this.arrivalTime) {
        return new Date(this.arrivalTime) - new Date(this.departureTime);
      }
      return null;
    }

    getFormattedDuration() {
      const duration = this.getDuration();
      if (!duration) return null;
      
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
  }

  Flight.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      flightNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 10],
        },
      },
      airlineId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'airlines',
          key: 'id',
        },
      },
      airplaneId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'airplanes',
          key: 'id',
        },
      },
      departureAirportId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'airports',
          key: 'id',
        },
      },
      arrivalAirportId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'airports',
          key: 'id',
        },
      },
      departureTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toISOString(),
        },
      },
      arrivalTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfterDeparture(value) {
            if (this.departureTime && value <= this.departureTime) {
              throw new Error('Arrival time must be after departure time');
            }
          },
        },
      },
      status: {
        type: DataTypes.ENUM(
          'scheduled',
          'boarding',
          'departed',
          'in-flight',
          'arrived',
          'delayed',
          'cancelled'
        ),
        defaultValue: 'scheduled',
        allowNull: false,
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'USD',
        allowNull: false,
        validate: {
          len: [3, 3],
        },
      },
      availableSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      totalSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      gate: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      terminal: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      estimatedDepartureTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      estimatedArrivalTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actualDepartureTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actualArrivalTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delayReason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      baggage: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
          carryOn: { weight: 7, dimensions: '55x40x20' },
          checked: { weight: 23, count: 1 },
        },
      },
      amenities: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      flightClass: {
        type: DataTypes.ENUM('economy', 'premium-economy', 'business', 'first'),
        defaultValue: 'economy',
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Flight',
      tableName: 'flights',
      indexes: [
        {
          fields: ['flightNumber'],
        },
        {
          fields: ['airlineId'],
        },
        {
          fields: ['departureAirportId'],
        },
        {
          fields: ['arrivalAirportId'],
        },
        {
          fields: ['departureTime'],
        },
        {
          fields: ['arrivalTime'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['flightClass'],
        },
        {
          name: 'flight_route_time',
          fields: ['departureAirportId', 'arrivalAirportId', 'departureTime'],
        },
      ],
    },
  );

  return Flight;
};
