const logger = require('./loggerMiddleware');
const {verifyToken} = require('../utils/jwtUtils');
const {UserAccessService} = require('../services');

module.exports = async (socket, next) => {
  const token = socket.handshake.auth.token;
  const decodedObj = verifyToken({token});
  if (!decodedObj) {
    logger.error('Socket cannot be authenticated');
    return next(new Error('Socket cannot be authenticated'));
  }

  const userId = decodedObj?.user?._id || decodedObj?._id;
  const accountStatus = await UserAccessService.getAccountStatus({
    userId,
    force: true,
  });
  if (!accountStatus.exists || accountStatus.isBlocked) {
    return next(new Error(accountStatus.blockReason || 'Account is blocked'));
  }

  socket.user = decodedObj;
  return next();
};
