const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');
const { 
  JWT_SECRET, 
  JWT_EXPIRES_IN, 
  JWT_REFRESH_SECRET, 
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS 
} = require('../config/server-config');
const { 
  AuthenticationError, 
  ValidationError, 
  NotFoundError 
} = require('../utils/errors/custom-errors');
const EmailService = require('./email-service');

class AuthService {
  // Generate JWT tokens
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  verifyToken(token, isRefreshToken = false) {
    try {
      const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
      return jwt.verify(token, secret);
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }

  // Register new user
  async register(userData) {
    const { email, password, firstName, lastName, phoneNumber } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError([{
        field: 'email',
        message: 'User with this email already exists',
        code: 'EMAIL_EXISTS'
      }]);
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      emailVerificationToken,
    });

    // Send verification email
    await EmailService.sendVerificationEmail(user.email, emailVerificationToken);

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = this.generateTokens(tokenPayload);

    // Save refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    return {
      user: user.getPublicProfile(),
      tokens,
    };
  }

  // Login user
  async login(email, password) {
    // Find user
    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = this.generateTokens(tokenPayload);

    // Save refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    return {
      user: user.getPublicProfile(),
      tokens,
    };
  }

  // Refresh tokens
  async refreshTokens(refreshToken) {
    const decoded = this.verifyToken(refreshToken, true);
    
    const user = await User.findOne({
      where: { 
        id: decoded.userId, 
        refreshToken,
        isActive: true 
      }
    });

    if (!user) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = this.generateTokens(tokenPayload);

    // Update refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    return {
      user: user.getPublicProfile(),
      tokens,
    };
  }

  // Logout user
  async logout(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Clear refresh token
    await user.update({ refreshToken: null });

    return { message: 'Logged out successfully' };
  }

  // Verify email
  async verifyEmail(token) {
    const user = await User.findOne({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      throw new ValidationError([{
        field: 'token',
        message: 'Invalid verification token',
        code: 'INVALID_TOKEN'
      }]);
    }

    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'Email verified successfully' };
  }

  // Request password reset
  async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send reset email
    await EmailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  // Reset password
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [require('sequelize').Op.gt]: new Date(),
        },
        isActive: true,
      }
    });

    if (!user) {
      throw new ValidationError([{
        field: 'token',
        message: 'Invalid or expired reset token',
        code: 'INVALID_TOKEN'
      }]);
    }

    await user.update({
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null, // Invalidate all sessions
    });

    return { message: 'Password reset successfully' };
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    await user.update({
      password: newPassword,
      refreshToken: null, // Invalidate all sessions
    });

    return { message: 'Password changed successfully' };
  }

  // Get user by token
  async getUserByToken(token) {
    const decoded = this.verifyToken(token);
    
    const user = await User.findOne({
      where: { id: decoded.userId, isActive: true }
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return user;
  }
}

module.exports = new AuthService();
