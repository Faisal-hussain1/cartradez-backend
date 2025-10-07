const config = require('config');

const {generalConstant} = require('../constants');
const {jwtUtils} = require('../utils');
const {getCookieDomain} = require('../utils/urlUtils');
const {AppError} = require('../factories');
const {SYSTEM_ROLES} = require('../constants/usersConstants');

module.exports = (data, req, res, next) => {
  if (data instanceof AppError) return next(data);

  const jwtData = req.jwtToken;

  // If there is no jwt token and is not login requested
  if (!jwtData && !data.body.isLoginRequest) return next(data);

  let userObj = jwtData ? jwtData.user : data.body.user;

  // Prepare the jwt token
  let payload = {
    user: {
      _id: userObj._id,
      email: userObj.email,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      currentActiveOrganization: userObj.currentActiveOrganization,
      ...(userObj.currentActiveOrganization.role === SYSTEM_ROLES.admin.value &&
        {}),
    },
  };

  console.log('payload', payload);

  const token = jwtUtils.generateToken({payload});
  const BASE_URL = config.get('frontendURL');
  console.log('BASE_URL', BASE_URL);
  const cookieDomain = getCookieDomain(BASE_URL);

  console.log('cookieDomain', cookieDomain);

  // Setting cookies
  const cookiesOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: generalConstant.cookieExpirationTime,
    domain: cookieDomain,
  };

  res.cookie(config.get('tokenVariable'), token, cookiesOpts);

  delete data.body.isLoginRequest; // This is only used for creating jwt, no need to send it to the client

  return next(data);
};
