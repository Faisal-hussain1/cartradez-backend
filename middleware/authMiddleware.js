const {GeneralErrorsFactory} = require('../factories');
const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const jwtUtils = require('../utils/jwtUtils');

module.exports = (req, res, next) => {
  const cookie = req.cookies[getTokenHeaderName()];
  const token = jwtUtils.verifyToken({token: cookie});

  if (token) {
    req.jwtToken = token;
    next();
  } else {
    next(GeneralErrorsFactory.invalidTokenErr());
  }
};
