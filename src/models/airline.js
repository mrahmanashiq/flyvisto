'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Airline extends Model {
    static associate(models) {
      // Airline has many flights
      Airline.hasMany(models.Flight, {
        foreignKey: 'airlineId',
        as: 'flights',
      });

      // Airline has many airplanes
      Airline.hasMany(models.Airplane, {
        foreignKey: 'airlineId',
        as: 'airplanes',
      });
    }
  }

  Airline.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        unique: true,
        validate: {
          isAlpha: true,
          len: [2, 3],
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
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      logo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      headquarters: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      foundedYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1900,
          max: new Date().getFullYear(),
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contactInfo: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 5,
        },
      },
    },
    {
      sequelize,
      modelName: 'Airline',
      tableName: 'airlines',
      indexes: [
        {
          unique: true,
          fields: ['code'],
        },
        {
          fields: ['country'],
        },
        {
          fields: ['isActive'],
        },
      ],
    },
  );

  return Airline;
};
