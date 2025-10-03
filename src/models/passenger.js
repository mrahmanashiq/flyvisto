'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Passenger extends Model {
    static associate(models) {
      // Passenger belongs to booking
      Passenger.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking',
      });

      // Passenger has one seat assignment
      Passenger.hasOne(models.BookingSeat, {
        foreignKey: 'passengerId',
        as: 'seatAssignment',
      });
    }

    // Instance methods
    getFullName() {
      return `${this.firstName} ${this.lastName}`.trim();
    }

    getAge() {
      if (!this.dateOfBirth) return null;

      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age;
    }

    isMinor() {
      const age = this.getAge();
      return age !== null && age < 18;
    }
  }

  Passenger.init(
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
      passengerType: {
        type: DataTypes.ENUM('adult', 'child', 'infant'),
        defaultValue: 'adult',
        allowNull: false,
      },
      title: {
        type: DataTypes.ENUM('mr', 'mrs', 'ms', 'dr', 'prof'),
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
      },
      middleName: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isNotFuture(value) {
            if (new Date(value) > new Date()) {
              throw new Error('Date of birth cannot be in the future');
            }
          },
        },
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
      },
      nationality: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      passportNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 20],
        },
      },
      passportExpiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isNotExpired(value) {
            const expiryDate = new Date(value);
            const today = new Date();
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

            if (expiryDate <= sixMonthsFromNow) {
              throw new Error('Passport must be valid for at least 6 months');
            }
          },
        },
      },
      passportIssuingCountry: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      visaRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      visaNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      frequentFlyerNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      specialMeals: {
        type: DataTypes.ENUM(
          'none',
          'vegetarian',
          'vegan',
          'halal',
          'kosher',
          'diabetic',
          'gluten-free',
          'low-sodium',
        ),
        defaultValue: 'none',
      },
      specialAssistance: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of assistance types like wheelchair, blind, etc.',
      },
      contactPhone: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
          is: /^[+]?[1-9]\d{1,14}$/,
        },
      },
      emergencyContact: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      baggage: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
          carryOn: [],
          checked: [],
        },
      },
      isCheckedIn: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      boardingPassIssued: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      checkInTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Passenger',
      tableName: 'passengers',
      indexes: [
        {
          fields: ['bookingId'],
        },
        {
          fields: ['passengerType'],
        },
        {
          fields: ['passportNumber'],
        },
        {
          fields: ['nationality'],
        },
        {
          fields: ['isCheckedIn'],
        },
        {
          name: 'passenger_name',
          fields: ['firstName', 'lastName'],
        },
      ],
    },
  );

  return Passenger;
};
