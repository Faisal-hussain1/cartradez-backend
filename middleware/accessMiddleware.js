const {AuthErrors} = require('../factories');

module.exports =
  ({customFn}) =>
  async (req, _, next) => {
    // The custom function that is passed in will be used to check if the user is allowed to access the route.
    const isAllowed = !customFn ? true : await customFn({req});
    if (!isAllowed) return next(AuthErrors.unauthorized());

    next();
  };
