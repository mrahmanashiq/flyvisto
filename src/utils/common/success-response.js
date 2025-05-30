function createSuccessResponse({ message = 'Request completed successfully', code = 'SUCCESS', data = {}, error = {} } = {}) {
  return {
    success: true,
    message,
    code,
    data,
    error
  };
}

module.exports = { 
    createSuccessResponse
};
