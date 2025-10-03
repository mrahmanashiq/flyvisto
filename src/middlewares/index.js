const { errorHandler, notFoundHandler } = require('./error-handlers');
const AirplaneMiddlewares = require('./airplane-middlewares');
const { apiVersioning, getVersionInfo } = require('./api-versioning');

module.exports = {
  errorHandler,
  notFoundHandler,
  AirplaneMiddlewares,
  apiVersioning,
  getVersionInfo,
};
