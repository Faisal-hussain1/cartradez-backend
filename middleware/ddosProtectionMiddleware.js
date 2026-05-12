const config = require('config');
const {rateLimit} = require('express-rate-limit');

const {GeneralErrorsFactory} = require('../factories');

module.exports = rateLimit({
  windowMs: config.get('windowSizeInMinutes') * 60 * 1000,
  max: config.get('maxRequestsAllowed'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    const url = req.originalUrl || req.url || '';
    const isUsersMeRequest = req.method === 'GET' && url.includes('/users/me');

    return (
      req.method === 'OPTIONS' ||
      req.url === '/favicon.ico' ||
      isUsersMeRequest
    );
  },
  handler: (req, res, next, options) => {
    next(GeneralErrorsFactory.tooManyRequestsErr());
  },
});
