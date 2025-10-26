'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Airplane extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Airplane belongs to airline
      Airplane.belongsTo(models.Airline, {
        foreignKey: 'airlineId',
        as: 'airline',
      });

      // Airplane has many flights
      Airplane.hasMany(models.Flight, {
        foreignKey: 'airplaneId',
        as: 'flights',
      });
    }
  }
  Airplane.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      airlineId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'airlines',
          key: 'id',
        },
      },
      modelNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
      },
      manufacturer: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      model: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      registrationNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 20],
        },
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1,
          max: 850,
        },
      },
      seatConfiguration: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
          economy: 0,
          premiumEconomy: 0,
          business: 0,
          first: 0,
        },
      },
      range: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Range in kilometers',
      },
      maxSpeed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Max speed in km/h',
      },
      manufactureDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      lastMaintenanceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      nextMaintenanceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'maintenance', 'retired', 'grounded'),
        defaultValue: 'active',
        allowNull: false,
      },
      fuelCapacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Fuel capacity in liters',
      },
      features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Airplane',
      tableName: 'airplanes',
      indexes: [
        {
          unique: true,
          fields: ['registrationNumber'],
        },
        {
          fields: ['airlineId'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['manufacturer'],
        },
        {
          fields: ['model'],
        },
      ],
    },
  );
  return Airplane;
};
