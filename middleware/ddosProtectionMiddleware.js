const config = require('config');
const {rateLimit} = require('express-rate-limit');

const {GeneralErrorsFactory} = require('../factories');

const isLoadTestBypassed = (req) => {
  const configuredBypassKey = process.env.RATE_LIMIT_BYPASS_KEY?.trim();
  if (!configuredBypassKey) return false;

  const incomingKey = req.headers['x-load-test-key'];
  return incomingKey === configuredBypassKey;
};

const isVehicleApiRequest = (req) => {
  const urlPath = req.path || req.originalUrl || req.url || '';
  return /^\/api\/v1\/vehicles(\/.*)?$/.test(urlPath);
};

const createLimiter = ({max}) =>
  rateLimit({
    windowMs: config.get('windowSizeInMinutes') * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      const url = req.originalUrl || req.url || '';
      const isUsersMeRequest = req.method === 'GET' && url.includes('/users/me');
      const isVehicleReadRequest = req.method === 'GET' && isVehicleApiRequest(req);
      const isNonProduction = process.env.NODE_ENV !== 'production';
      const shouldBypassVehiclesInNonProd = isNonProduction && isVehicleApiRequest(req);

      return (
        req.method === 'OPTIONS' ||
        req.url === '/favicon.ico' ||
        isUsersMeRequest ||
        shouldBypassVehiclesInNonProd ||
        (max === config.get('maxRequestsAllowed') && isVehicleReadRequest) ||
        isLoadTestBypassed(req)
      );
    },
    handler: (req, res, next) => {
      next(GeneralErrorsFactory.tooManyRequestsErr());
    },
  });

const globalLimiter = createLimiter({
  max: config.get('maxRequestsAllowed'),
});

const vehicleReadLimiter = createLimiter({
  max: config.get('vehicleReadMaxRequestsAllowed'),
});

module.exports = {
  globalLimiter,
  vehicleReadLimiter,
};
