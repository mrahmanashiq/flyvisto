import { StatusCodes } from 'http-status-codes';

const info = (req, res) => {
  consol.log('Info controller called');
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'All ok',
    error: {},
    data: {},
  });
};

export { info };
