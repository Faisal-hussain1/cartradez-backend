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
    const isDevOrTest = process.env.NODE_ENV !== 'production';
    const isVehiclesListingRequest = req.method === 'GET' && url.includes('/api/v1/vehicles');
    const shouldBypassForLoadTesting = isDevOrTest && isVehiclesListingRequest;

    return (
      req.method === 'OPTIONS' ||
      req.url === '/favicon.ico' ||
      isUsersMeRequest ||
      shouldBypassForLoadTesting
    );
  },
  handler: (req, res, next, options) => {
    next(GeneralErrorsFactory.tooManyRequestsErr());
  },
});
