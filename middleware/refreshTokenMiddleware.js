const config = require('config');

const {generalConstant} = require('../constants');
const {jwtUtils, checkErrorType} = require('../utils');
const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const {getCookieDomain} = require('../utils/urlUtils');

module.exports = (data, req, res, next) => {
  const {isAppError, isError} = checkErrorType({error: data});

  if (isError || isAppError) return next(data);

  const jwtData = req.jwtToken;

  // If there is no jwt token and is not login requested
  if (!jwtData && !data.body.isLoginRequest) return next(data);

  // Prepare the jwt token
  const payload = {
    user: jwtData ? jwtData.user : data.body.user,
  };
  const token = jwtUtils.generateToken({payload});
  const BASE_URL = config.get('frontendURL');
  const cookieDomain = getCookieDomain({url: BASE_URL});

  // Setting cookies
  const cookiesOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: generalConstant.cookieExpirationTime,
    domain: cookieDomain,
  };
  res.cookie(getTokenHeaderName(), token, cookiesOpts);

  delete data.body.isLoginRequest; // This is only used for creating jwt, no need to send it to the client

  return next(data);
};
