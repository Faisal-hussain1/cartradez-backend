const logger = require('./loggerMiddleware');
const {verifyToken, getToken} = require('../utils/jwtUtils');

module.exports = (socket, next) => {
  const token = getToken({cookieStr: socket.handshake.headers.cookie});

  // verify token
  const decodedObj = verifyToken({token});

  if (decodedObj) {
    socket.organizationId =
      decodedObj?.user.currentActiveOrganization.organizationId;
    next();
  } else {
    logger.error('Socket cannot be authenticated');
  }
};
