'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingSeat extends Model {
    static associate(models) {
      // BookingSeat belongs to booking
      BookingSeat.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking',
      });

      // BookingSeat belongs to seat
      BookingSeat.belongsTo(models.Seat, {
        foreignKey: 'seatId',
        as: 'seat',
      });

      // BookingSeat belongs to passenger
      BookingSeat.belongsTo(models.Passenger, {
        foreignKey: 'passengerId',
        as: 'passenger',
      });
    }
  }

  BookingSeat.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id',
        },
      },
      seatId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'seats',
          key: 'id',
        },
      },
      passengerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'passengers',
          key: 'id',
        },
      },
      seatPrice: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM('selected', 'confirmed', 'cancelled'),
        defaultValue: 'selected',
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'BookingSeat',
      tableName: 'booking_seats',
      indexes: [
        {
          unique: true,
          fields: ['bookingId', 'seatId'],
        },
        {
          unique: true,
          fields: ['passengerId'],
        },
        {
          fields: ['bookingId'],
        },
        {
          fields: ['seatId'],
        },
        {
          fields: ['status'],
        },
      ],
    },
  );

  return BookingSeat;
};
