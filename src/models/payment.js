'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Payment belongs to booking
      Payment.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking',
      });

      // Payment belongs to user
      Payment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }

    // Instance methods
    isSuccessful() {
      return this.status === 'completed';
    }

    isPending() {
      return this.status === 'pending';
    }

    isFailed() {
      return ['failed', 'cancelled'].includes(this.status);
    }

    isRefunded() {
      return this.status === 'refunded';
    }

    getFormattedAmount() {
      return `${this.currency} ${parseFloat(this.amount).toFixed(2)}`;
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      paymentReference: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      bookingId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      amount: {
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
      paymentMethod: {
        type: DataTypes.ENUM(
          'credit_card',
          'debit_card',
          'paypal',
          'bank_transfer',
          'wallet',
          'cash'
        ),
        allowNull: false,
      },
      paymentProvider: {
        type: DataTypes.ENUM('stripe', 'paypal', 'square', 'razorpay', 'manual'),
        allowNull: false,
      },
      providerTransactionId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'processing',
          'completed',
          'failed',
          'cancelled',
          'refunded',
          'partially_refunded'
        ),
        defaultValue: 'pending',
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      failureReason: {
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
      refundDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      refundReason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cardLast4: {
        type: DataTypes.STRING(4),
        allowNull: true,
        validate: {
          len: [4, 4],
          isNumeric: true,
        },
      },
      cardBrand: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      billingAddress: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      fees: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Processing fees, taxes, etc.',
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
      modelName: 'Payment',
      tableName: 'payments',
      hooks: {
        beforeCreate: (payment) => {
          if (!payment.paymentReference) {
            payment.paymentReference = 'PAY' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
          }
        },
      },
      indexes: [
        {
          unique: true,
          fields: ['paymentReference'],
        },
        {
          fields: ['bookingId'],
        },
        {
          fields: ['userId'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['paymentMethod'],
        },
        {
          fields: ['paymentProvider'],
        },
        {
          fields: ['providerTransactionId'],
        },
        {
          fields: ['paymentDate'],
        },
      ],
    },
  );

  return Payment;
};
