'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Airport extends Model {
    static associate(models) {
      // Airport has many departure flights
      Airport.hasMany(models.Flight, {
        foreignKey: 'departureAirportId',
        as: 'departureFlights',
      });

      // Airport has many arrival flights
      Airport.hasMany(models.Flight, {
        foreignKey: 'arrivalAirportId',
        as: 'arrivalFlights',
      });
    }
  }

  Airport.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 150],
        },
      },
      iataCode: {
        type: DataTypes.STRING(3),
        allowNull: false,
        unique: true,
        validate: {
          isAlpha: true,
          len: [3, 3],
        },
      },
      icaoCode: {
        type: DataTypes.STRING(4),
        allowNull: true,
        unique: true,
        validate: {
          isAlpha: true,
          len: [4, 4],
        },
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      country: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        validate: {
          min: -90,
          max: 90,
        },
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        validate: {
          min: -180,
          max: 180,
        },
      },
      timezone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      elevation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Elevation in feet',
      },
      terminals: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      facilities: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isInternational: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Airport',
      tableName: 'airports',
      indexes: [
        {
          unique: true,
          fields: ['iataCode'],
        },
        {
          unique: true,
          fields: ['icaoCode'],
        },
        {
          fields: ['city'],
        },
        {
          fields: ['country'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['isInternational'],
        },
      ],
    },
  );

  return Airport;
};
