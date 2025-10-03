const { Logger } = require('../config');
const { StatusCodes } = require('http-status-codes');

/**
 * API Versioning Middleware
 * Handles API version detection and validation
 */

// Supported API versions
const SUPPORTED_VERSIONS = ['v1'];
const DEFAULT_VERSION = 'v1';
const DEPRECATED_VERSIONS = [];

/**
 * Extract API version from request
 */
const extractVersion = (req) => {
  // Check URL path for version (e.g., /api/v1/users)
  const pathMatch = req.path.match(/^\/api\/(v\d+)/);
  if (pathMatch) {
    return pathMatch[1];
  }

  // Check Accept header for version
  const acceptHeader = req.get('Accept');
  if (acceptHeader) {
    const versionMatch = acceptHeader.match(/version=(\d+)/);
    if (versionMatch) {
      return `v${versionMatch[1]}`;
    }
  }

  // Check custom header
  const versionHeader = req.get('X-API-Version');
  if (versionHeader) {
    return versionHeader;
  }

  return null;
};

/**
 * Validate API version
 */
const validateVersion = (version) => {
  if (!version) {
    return { valid: true, version: DEFAULT_VERSION, deprecated: false };
  }

  const isValid = SUPPORTED_VERSIONS.includes(version);
  const isDeprecated = DEPRECATED_VERSIONS.includes(version);

  return {
    valid: isValid,
    version: isValid ? version : DEFAULT_VERSION,
    deprecated: isDeprecated,
    requested: version
  };
};

/**
 * API Versioning Middleware
 */
const apiVersioning = (req, res, next) => {
  const extractedVersion = extractVersion(req);
  const validation = validateVersion(extractedVersion);

  // Set version info in request
  req.apiVersion = validation.version;
  req.requestedVersion = validation.requested;
  req.isDeprecatedVersion = validation.deprecated;

  // Log version usage
  Logger.debug('API Version Detection', {
    requested: validation.requested,
    resolved: validation.version,
    deprecated: validation.deprecated,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId
  });

  // Add deprecation warning header if using deprecated version
  if (validation.deprecated) {
    res.set('X-API-Deprecation-Warning', 
      `Version ${validation.requested} is deprecated. Please upgrade to ${DEFAULT_VERSION}`);
  }

  // Add version info to response headers
  res.set('X-API-Version', validation.version);

  // If invalid version requested, return error
  if (validation.requested && !validation.valid) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Unsupported API version: ${validation.requested}`,
      code: 'UNSUPPORTED_API_VERSION',
      supportedVersions: SUPPORTED_VERSIONS,
      defaultVersion: DEFAULT_VERSION,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Version-specific route handler
 */
const versionRoute = (version, handler) => {
  return (req, res, next) => {
    if (req.apiVersion === version) {
      return handler(req, res, next);
    }
    next();
  };
};

/**
 * Middleware to require minimum version
 */
const requireMinVersion = (minVersion) => {
  return (req, res, next) => {
    const currentVersion = req.apiVersion;
    const currentVersionNum = parseInt(currentVersion.replace('v', ''));
    const minVersionNum = parseInt(minVersion.replace('v', ''));

    if (currentVersionNum < minVersionNum) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `This endpoint requires API version ${minVersion} or higher`,
        code: 'VERSION_TOO_LOW',
        currentVersion,
        requiredVersion: minVersion,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Get API version info endpoint
 */
const getVersionInfo = (req, res) => {
  res.json({
    success: true,
    data: {
      currentVersion: req.apiVersion,
      requestedVersion: req.requestedVersion,
      supportedVersions: SUPPORTED_VERSIONS,
      defaultVersion: DEFAULT_VERSION,
      deprecatedVersions: DEPRECATED_VERSIONS,
      isDeprecated: req.isDeprecatedVersion
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  apiVersioning,
  versionRoute,
  requireMinVersion,
  getVersionInfo,
  SUPPORTED_VERSIONS,
  DEFAULT_VERSION,
  DEPRECATED_VERSIONS
};
