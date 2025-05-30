const requestContext = require('../utils/common/request-context')

const { v4: uuidv4 } = require('uuid');

function attachCorrelationId(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || `req-${Date.now()}-${uuidv4().slice(0, 5)}`;

  requestContext.setRequestContext({ correlationId });

  res.setHeader('x-correlation-id', correlationId);
  next();
}

module.exports = attachCorrelationId;
