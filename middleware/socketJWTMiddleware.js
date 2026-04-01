const logger = require('./loggerMiddleware');
const {verifyToken, getToken} = require('../utils/jwtUtils');

module.exports = (socket, next) => {
  const token = socket.handshake.auth.token;
  // verify token
  const decodedObj = verifyToken({token});
  socket.user = decodedObj;
  if (decodedObj) {
    next();
  } else {
    logger.error('Socket cannot be authenticated');
  }
};
