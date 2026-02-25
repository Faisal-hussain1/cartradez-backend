module.exports = (req, res, next) => {
  const user = req.jwtToken?.user;

  if (!user) {
    return next({
      statusCode: 401,
      message: 'Authentication required',
    });
  }

  if (!user.isVerified) {
    return next({
      statusCode: 403,
      message: 'Please verify your account to continue',
      code: 'USER_NOT_VERIFIED',
    });
  }

  next();
};
