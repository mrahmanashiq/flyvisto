const { errorHandler, notFoundHandler } = require('./error-handlers');
const AirplaneMiddlewares = require('./airplane-middlewares');
const { apiVersioning, getVersionInfo } = require('./api-versioning');
const { httpRequestLogger, getRequestMetrics } = require('./request-logging');

module.exports = {
  errorHandler,
  notFoundHandler,
  AirplaneMiddlewares,
  apiVersioning,
  getVersionInfo,
  httpRequestLogger,
  getRequestMetrics,
};
