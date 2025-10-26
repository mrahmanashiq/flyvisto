'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many bookings
      User.hasMany(models.Booking, {
        foreignKey: 'userId',
        as: 'bookings',
      });

      // User has many notifications
      User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications',
      });
    }

    // Instance method to check password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    // Instance method to get public profile
    getPublicProfile() {
      const { password, refreshToken, ...publicData } = this.toJSON();
      return publicData;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [8, 255],
        },
      },
      phoneNumber: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
          is: /^[+]?[1-9]\d{1,14}$/,
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      passportNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('customer', 'admin', 'agent'),
        defaultValue: 'customer',
        allowNull: false,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      emailVerificationToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      passwordResetToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      profilePicture: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      preferences: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
          currency: 'USD',
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const saltRounds = 12;
            user.password = await bcrypt.hash(user.password, saltRounds);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const saltRounds = 12;
            user.password = await bcrypt.hash(user.password, saltRounds);
          }
        },
      },
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
        {
          fields: ['role'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['emailVerificationToken'],
        },
        {
          fields: ['passwordResetToken'],
        },
      ],
    },
  );

  return User;
};
