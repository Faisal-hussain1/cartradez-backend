const {GeneralErrorsFactory} = require('../factories');
const {UsersErrorsFactory} = require('../factories');
const {UserAccessService} = require('../services');
// const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const jwtUtils = require('../utils/jwtUtils');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;
  if (!headerToken) return next(GeneralErrorsFactory.invalidTokenErr());

  const token = jwtUtils.verifyToken({token: headerToken});
  
  if (!token) return next(GeneralErrorsFactory.invalidTokenErr());

  const userId = token?.user?._id || token?._id;
  const isCurrentUserRequest =
    req.baseUrl?.endsWith('/users') && req.path === '/me';
  const requiresFreshStatus =
    req.method !== 'GET' ||
    isCurrentUserRequest ||
    req.baseUrl?.endsWith('/chat');
  const accountStatus = await UserAccessService.getAccountStatus({
    userId,
    force: requiresFreshStatus,
  });
  if (!accountStatus.exists) return next(GeneralErrorsFactory.invalidTokenErr());

  req.jwtToken = token;
  req.accountStatus = accountStatus;

  if (accountStatus.isBlocked && !isCurrentUserRequest) {
    return next(UsersErrorsFactory.userBlockedErr(accountStatus.blockReason));
  }

  return next();
};
