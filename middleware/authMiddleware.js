const {GeneralErrorsFactory} = require('../factories');
// const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const jwtUtils = require('../utils/jwtUtils');

module.exports = (req, res, next) => {
  const headerToken = req.headers['authorization'].split(' ')[1];
  if(!headerToken){
    console.log("Missing Token")
  }
  const token = jwtUtils.verifyToken({token: headerToken});

  if (token) {
    req.jwtToken = token;
    next();
  } else {
    next(GeneralErrorsFactory.invalidTokenErr());
  }
};
