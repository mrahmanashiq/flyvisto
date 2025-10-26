'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // Booking belongs to user
      Booking.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      // Booking belongs to flight
      Booking.belongsTo(models.Flight, {
        foreignKey: 'flightId',
        as: 'flight',
      });

      // Booking has many passengers
      Booking.hasMany(models.Passenger, {
        foreignKey: 'bookingId',
        as: 'passengers',
      });

      // Booking has many payments
      Booking.hasMany(models.Payment, {
        foreignKey: 'bookingId',
        as: 'payments',
      });

      // Booking has many selected seats
      Booking.hasMany(models.BookingSeat, {
        foreignKey: 'bookingId',
        as: 'selectedSeats',
      });
    }

    // Instance methods
    getTotalAmount() {
      return parseFloat(this.totalAmount);
    }

    isPaid() {
      return this.paymentStatus === 'paid';
    }

    isConfirmed() {
      return this.status === 'confirmed';
    }

    canBeCancelled() {
      const now = new Date();
      const departureTime = new Date(this.flight?.departureTime);
      const hoursDifference = (departureTime - now) / (1000 * 60 * 60);

      return (
        hoursDifference > 24 && ['confirmed', 'pending'].includes(this.status)
      );
    }

    generatePNR() {
      // Generate a 6-character alphanumeric PNR
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  }

  Booking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bookingReference: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      pnr: {
        type: DataTypes.STRING(6),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      flightId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'flights',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'confirmed',
          'cancelled',
          'completed',
          'no-show',
        ),
        defaultValue: 'pending',
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM(
          'pending',
          'paid',
          'failed',
          'refunded',
          'partial-refund',
        ),
        defaultValue: 'pending',
        allowNull: false,
      },
      totalAmount: {
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
      passengerCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 9, // Maximum passengers per booking
        },
      },
      contactEmail: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      contactPhone: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
          is: /^[+]?[1-9]\d{1,14}$/,
        },
      },
      specialRequests: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bookingDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      cancellationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancellationReason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      refundAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      checkInStatus: {
        type: DataTypes.ENUM(
          'not-checked-in',
          'checked-in',
          'boarding-pass-issued',
        ),
        defaultValue: 'not-checked-in',
        allowNull: false,
      },
      checkInTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
      hooks: {
        beforeCreate: (booking) => {
          if (!booking.bookingReference) {
            booking.bookingReference = 'BK' + Date.now().toString().slice(-8);
          }
          if (!booking.pnr) {
            booking.pnr = booking.generatePNR();
          }
        },
      },
      indexes: [
        {
          unique: true,
          fields: ['bookingReference'],
        },
        {
          unique: true,
          fields: ['pnr'],
        },
        {
          fields: ['userId'],
        },
        {
          fields: ['flightId'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['paymentStatus'],
        },
        {
          fields: ['bookingDate'],
        },
        {
          fields: ['contactEmail'],
        },
      ],
    },
  );

  return Booking;
};
