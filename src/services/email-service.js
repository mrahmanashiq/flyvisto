const nodemailer = require('nodemailer');
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  FROM_EMAIL,
  isDevelopment,
} = require('../config/server-config');
const { Logger } = require('../config');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    if (isDevelopment) {
      // Use ethereal for development
      return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass',
        },
      });
    }

    return nodemailer.createTransporter({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const info = await this.transporter.sendMail(mailOptions);

      Logger.info('Email sent successfully', {
        to,
        subject,
        messageId: info.messageId,
      });

      return info;
    } catch (error) {
      Logger.error('Failed to send email', {
        to,
        subject,
        error: error.message,
      });
      throw error;
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const subject = 'Verify Your Email - Flyvisto';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Flyvisto!</h2>
        <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with Flyvisto, please ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const subject = 'Reset Your Password - Flyvisto';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendBookingConfirmation(email, bookingData) {
    const subject = `Booking Confirmation - ${bookingData.pnr}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Booking Confirmed!</h2>
        <p>Your flight booking has been confirmed. Here are your booking details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking Reference:</strong> ${bookingData.bookingReference}</p>
          <p><strong>PNR:</strong> ${bookingData.pnr}</p>
          <p><strong>Flight:</strong> ${bookingData.flight.flightNumber}</p>
          <p><strong>Route:</strong> ${bookingData.flight.departureAirport.city} → ${bookingData.flight.arrivalAirport.city}</p>
          <p><strong>Departure:</strong> ${new Date(bookingData.flight.departureTime).toLocaleString()}</p>
          <p><strong>Arrival:</strong> ${new Date(bookingData.flight.arrivalTime).toLocaleString()}</p>
          <p><strong>Passengers:</strong> ${bookingData.passengerCount}</p>
          <p><strong>Total Amount:</strong> ${bookingData.currency} ${bookingData.totalAmount}</p>
        </div>

        <p>Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/${bookingData.id}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Booking Details
          </a>
        </div>

        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Thank you for choosing Flyvisto. Have a great flight!
        </p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendFlightStatusUpdate(email, flightData, statusType) {
    let subject, message, color;

    switch (statusType) {
      case 'delay':
        subject = `Flight Delayed - ${flightData.flightNumber}`;
        message = `Your flight ${flightData.flightNumber} has been delayed.`;
        color = '#ffc107';
        break;
      case 'cancellation':
        subject = `Flight Cancelled - ${flightData.flightNumber}`;
        message = `We regret to inform you that your flight ${flightData.flightNumber} has been cancelled.`;
        color = '#dc3545';
        break;
      case 'gate_change':
        subject = `Gate Change - ${flightData.flightNumber}`;
        message = `The gate for your flight ${flightData.flightNumber} has been changed.`;
        color = '#17a2b8';
        break;
      default:
        subject = `Flight Update - ${flightData.flightNumber}`;
        message = `There's an update for your flight ${flightData.flightNumber}.`;
        color = '#007bff';
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">Flight Status Update</h2>
        <p>${message}</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Flight Details</h3>
          <p><strong>Flight:</strong> ${flightData.flightNumber}</p>
          <p><strong>Route:</strong> ${flightData.departureAirport.city} → ${flightData.arrivalAirport.city}</p>
          <p><strong>Scheduled Departure:</strong> ${new Date(flightData.departureTime).toLocaleString()}</p>
          <p><strong>Scheduled Arrival:</strong> ${new Date(flightData.arrivalTime).toLocaleString()}</p>
          ${flightData.estimatedDepartureTime ? `<p><strong>Estimated Departure:</strong> ${new Date(flightData.estimatedDepartureTime).toLocaleString()}</p>` : ''}
          ${flightData.gate ? `<p><strong>Gate:</strong> ${flightData.gate}</p>` : ''}
          ${flightData.terminal ? `<p><strong>Terminal:</strong> ${flightData.terminal}</p>` : ''}
        </div>

        <p>Please check your email and our website regularly for further updates.</p>
        
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from Flyvisto flight tracking system.
        </p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();
