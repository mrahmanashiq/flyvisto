function createSuccessResponse({
  message = 'Request completed successfully',
  code = 'SUCCESS',
  data = {},
} = {}) {
  return {
    success: true,
    message,
    code,
    data,
  };
}

module.exports = {
  createSuccessResponse,
};
