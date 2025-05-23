const { StatusCodes } = require('http-status-codes');

const info = (req, res) => {
  console.log('Info controller called');
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'All ok',
    error: {},
    data: {},
  });
};

module.exports = { info };
