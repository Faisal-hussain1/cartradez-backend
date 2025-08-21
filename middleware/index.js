const authMiddleware = require(`./authMiddleware`);
const validatorMiddleware = require(`./validatorMiddleware`);
const errorMiddleware = require(`./errorMiddleware`);
const accessMiddleware = require('./accessMiddleware');
const aclAccessMiddleware = require('./aclAccessMiddleware');
const ddosProtectionMiddleware = require('./ddosProtectionMiddleware');
const fileUploadMiddleware = require('./fileUploadMiddleware');
const finalResponseMiddleware = require('./finalResponseMiddleware');
const loggerMiddleware = require('./loggerMiddleware');
const preparedObjectMiddleware = require('./preparedObjectMiddleware');
const refreshTokenMiddleware = require('./refreshTokenMiddleware');
const socketJWTMiddleware = require('./socketJWTMiddleware');

module.exports = {
  authMiddleware,
  validatorMiddleware,
  errorMiddleware,
  refreshTokenMiddleware,
  finalResponseMiddleware,
  logger: loggerMiddleware, // logger.error() sounds more appropriate than loggerMiddleware.error() IMO.
  accessMiddleware,
  preparedObjectMiddleware,
  ddosProtectionMiddleware,
  fileUploadMiddleware,
  socketJWTMiddleware,
  aclAccessMiddleware,
};
