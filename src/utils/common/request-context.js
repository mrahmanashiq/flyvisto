const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

function getRequestContext() {
  return asyncLocalStorage.getStore() || {};
}

function setRequestContext(data) {
  asyncLocalStorage.enterWith(data);
}

const requestContext = {
  getRequestContext,
  setRequestContext
};

module.exports = requestContext
