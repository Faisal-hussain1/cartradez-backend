const {AppError} = require('../factories');
const config = require('config');
const logger = require('./loggerMiddleware');
const {
  GENERAL_ERROR_TYPES,
} = require('../constants/responses/errors/general');
const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const {getCookieDomain} = require('../utils/urlUtils');

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

  if (data.internalErr?.type === GENERAL_ERROR_TYPES.invalidToken.value) {
    const cookieDomain = getCookieDomain({url: config.get('frontendURL')});

    res.clearCookie(getTokenHeaderName(), {
      domain: cookieDomain,
      path: '/',
    });
  }

  logger.error(errData.error);

  return next(errData);
};
