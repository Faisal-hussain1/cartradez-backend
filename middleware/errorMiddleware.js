const {AppError} = require('../factories');
const logger = require('./loggerMiddleware');

module.exports = (data, req, res, next) => {
  if (!(data instanceof AppError)) return next(data);

  data.statusCode = data.statusCode || 500;
  data.status = data.status ?? 'error';

  data.message =
    data.statusCode === 500 ? 'Something went wrong' : data.message;

  const errData = {
    statusCode: data.statusCode,
    message: data.message,
    error: data.internalErr?.type ? data.internalErr : undefined,
  };
  logger.error(errData.error);

  return next(errData);
};
