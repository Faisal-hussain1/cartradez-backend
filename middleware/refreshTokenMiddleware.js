const config = require('config');

const {generalConstant} = require('../constants');
const {jwtUtils} = require('../utils');
const {AppError} = require('../factories');
const {SYSTEM_ROLES} = require('../constants/usersConstants');
const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const {getCookieDomain} = require('../utils/urlUtils');

module.exports = (data, req, res, next) => {
  if (data instanceof AppError) return next(data);

  const jwtData = req.jwtToken;

  // If there is no jwt token and is not login requested
  if (!jwtData && !data.body?.isLoginRequest) return next(data);

  const userObj = jwtData?.user || jwtData || data.body?.user;

  if (!userObj?._id || !userObj?.email) {
    return next(data);
  }

  const currentActiveOrganization = userObj.currentActiveOrganization || {
    role: userObj.systemRole,
  };

  // Prepare the jwt token
  let payload = {
    user: {
      _id: userObj._id,
      email: userObj.email,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      systemRole: userObj.systemRole || currentActiveOrganization?.role,
      currentActiveOrganization,
      ...(currentActiveOrganization?.role === SYSTEM_ROLES.admin.value &&
        {}),
    },
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
  res.set(getTokenHeaderName(), token);

  delete data.body?.isLoginRequest; // This is only used for creating jwt, no need to send it to the client

  return next(data);
};
