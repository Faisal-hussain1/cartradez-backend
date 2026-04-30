const {GeneralErrorsFactory} = require('../factories');
// const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const jwtUtils = require('../utils/jwtUtils');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;
  if (!headerToken) return next(GeneralErrorsFactory.invalidTokenErr());

  const token = jwtUtils.verifyToken({token: headerToken});

  if (token) {
    req.jwtToken = token;
    next();
  } else {
    next(GeneralErrorsFactory.invalidTokenErr());
  }
};
