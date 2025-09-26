'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Notification belongs to user
      Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      // Notification can belong to booking (optional)
      Notification.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking',
        allowNull: true,
      });
    }

    // Instance methods
    markAsRead() {
      this.isRead = true;
      this.readAt = new Date();
      return this.save();
    }

    isExpired() {
      if (!this.expiresAt) return false;
      return new Date() > this.expiresAt;
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      bookingId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'bookings',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM(
          'booking_confirmation',
          'payment_success',
          'payment_failed',
          'flight_delay',
          'flight_cancellation',
          'gate_change',
          'check_in_reminder',
          'boarding_reminder',
          'promotional',
          'system_maintenance',
          'account_update'
        ),
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 200],
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional data for the notification',
      },
      channels: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: ['in-app'],
        comment: 'Array of channels: in-app, email, sms, push',
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deliveryStatus: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Status for each channel',
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actionUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      actionText: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['bookingId'],
        },
        {
          fields: ['type'],
        },
        {
          fields: ['priority'],
        },
        {
          fields: ['isRead'],
        },
        {
          fields: ['isSent'],
        },
        {
          fields: ['expiresAt'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    },
  );

  return Notification;
};
