'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Seat extends Model {
    static associate(models) {
      // Seat belongs to flight
      Seat.belongsTo(models.Flight, {
        foreignKey: 'flightId',
        as: 'flight',
      });

      // Seat has many booking seats (for tracking assignments)
      Seat.hasMany(models.BookingSeat, {
        foreignKey: 'seatId',
        as: 'bookingSeats',
      });
    }

    // Instance methods
    getSeatNumber() {
      return `${this.row}${this.column}`;
    }

    isPremium() {
      return ['business', 'first'].includes(this.seatClass);
    }

    hasExtraLegroom() {
      return this.features && this.features.includes('extra-legroom');
    }

    isWindowSeat() {
      return ['A', 'F'].includes(this.column); // Assuming 6-across seating
    }

    isAisleSeat() {
      return ['C', 'D'].includes(this.column); // Assuming 6-across seating
    }
  }

  Seat.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      flightId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'flights',
          key: 'id',
        },
      },
      seatNumber: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 4],
        },
      },
      row: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 100,
        },
      },
      column: {
        type: DataTypes.STRING(1),
        allowNull: false,
        validate: {
          isIn: [['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']],
        },
      },
      seatClass: {
        type: DataTypes.ENUM('economy', 'premium-economy', 'business', 'first'),
        defaultValue: 'economy',
        allowNull: false,
      },
      seatType: {
        type: DataTypes.ENUM('window', 'middle', 'aisle'),
        allowNull: false,
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Blocked for maintenance or other reasons',
      },
      basePrice: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of features like extra-legroom, power-outlet, etc.',
      },
      deck: {
        type: DataTypes.ENUM('main', 'upper'),
        defaultValue: 'main',
        comment: 'For double-decker aircraft',
      },
      exitRow: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Seat',
      tableName: 'seats',
      indexes: [
        {
          unique: true,
          fields: ['flightId', 'seatNumber'],
        },
        {
          fields: ['flightId'],
        },
        {
          fields: ['seatClass'],
        },
        {
          fields: ['seatType'],
        },
        {
          fields: ['isAvailable'],
        },
        {
          fields: ['isBlocked'],
        },
        {
          fields: ['row'],
        },
        {
          fields: ['column'],
        },
      ],
    },
  );

  return Seat;
};
