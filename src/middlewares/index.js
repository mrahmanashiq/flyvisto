const { errorHandler, notFoundHandler } = require("./error-handlers");
const AirplaneMiddlewares = require("./airplane-middlewares");

module.exports = {
    errorHandler,
    notFoundHandler,
    AirplaneMiddlewares
};
