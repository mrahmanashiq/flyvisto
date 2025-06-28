const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

function getRequestContext() {
  return asyncLocalStorage.getStore() || {};
}

function setRequestContext(data) {
  const currentContext = getRequestContext();
  asyncLocalStorage.enterWith({ ...currentContext, ...data });
}

// Helper to set service method name for logging
function setServiceMethod(serviceName) {
  setRequestContext({ serviceName });
}

const requestContext = {
  getRequestContext,
  setRequestContext,
  setServiceMethod,
};

module.exports = requestContext;
