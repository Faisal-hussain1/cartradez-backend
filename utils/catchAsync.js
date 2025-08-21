// eslint-disable-next-line local-rules/enforce-single-object-param
module.exports = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};
