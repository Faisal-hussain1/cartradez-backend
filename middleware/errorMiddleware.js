const logger = require('./loggerMiddleware');

const {GeneralErrorsFactory} = require('../factories');
const {checkErrorType} = require('../utils/general');

module.exports = (data, req, res, next) => {
  const {isAppError, isError} = checkErrorType({error: data});

  if (!isAppError && !isError) return next(data);

  logger.error(data);

  if (isError && !isAppError) data = GeneralErrorsFactory.internalErr();

  data.statusCode = data.statusCode || 500;
  data.status = data.status ?? 'error';

  data.message =
    data.statusCode === 500 ? 'Something went wrong' : data.message;

  const errData = {
    statusCode: data.statusCode,
    message: data.message,
    error: data.internalErr?.type ? data.internalErr : undefined,
  };

  return next(errData);
};
