const { StatusCodes } = require('http-status-codes');
const AuthService = require('../services/auth-service');
const { ErrorResponse, SuccessResponse } = require('../utils/common');
const { ValidationError } = require('../utils/errors/custom-errors');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { firstName, lastName, email, password, confirmPassword, phoneNumber } = req.body;

      // Validate password confirmation
      if (password !== confirmPassword) {
        throw new ValidationError([{
          field: 'confirmPassword',
          message: 'Passwords do not match',
          code: 'PASSWORD_MISMATCH'
        }]);
      }

      const result = await AuthService.register({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
      });

      res.status(StatusCodes.CREATED).json(
        SuccessResponse.createSuccessResponse({
          message: 'User registered successfully. Please check your email to verify your account.',
          code: 'USER_REGISTERED',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Login successful',
          code: 'LOGIN_SUCCESS',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Refresh tokens
  async refreshTokens(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshTokens(refreshToken);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Tokens refreshed successfully',
          code: 'TOKENS_REFRESHED',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const result = await AuthService.logout(req.user.id);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Logout successful',
          code: 'LOGOUT_SUCCESS',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;
      const result = await AuthService.verifyEmail(token);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Email verified successfully',
          code: 'EMAIL_VERIFIED',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Password reset instructions sent',
          code: 'RESET_REQUESTED',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;

      // Validate password confirmation
      if (password !== confirmPassword) {
        throw new ValidationError([{
          field: 'confirmPassword',
          message: 'Passwords do not match',
          code: 'PASSWORD_MISMATCH'
        }]);
      }

      const result = await AuthService.resetPassword(token, password);

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Password reset successfully',
          code: 'PASSWORD_RESET',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate password confirmation
      if (newPassword !== confirmPassword) {
        throw new ValidationError([{
          field: 'confirmPassword',
          message: 'Passwords do not match',
          code: 'PASSWORD_MISMATCH'
        }]);
      }

      const result = await AuthService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Password changed successfully',
          code: 'PASSWORD_CHANGED',
          data: result,
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      res.status(StatusCodes.OK).json(
        SuccessResponse.createSuccessResponse({
          message: 'Profile retrieved successfully',
          code: 'PROFILE_RETRIEVED',
          data: { user: req.user.getPublicProfile() },
        })
      );
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse.createErrorResponse({ error }));
    }
  }
}

module.exports = new AuthController();
