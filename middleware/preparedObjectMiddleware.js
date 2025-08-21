const {GeneralErrorsFactory} = require('../factories');
const {asyncTryCatch} = require('../utils/tryCatchUtils');

module.exports.setPreparedObject =
  ({model, _id, key}) =>
  async (req, _, next) => {
    const {response, error} = await asyncTryCatch({
      fn: async () => await model.findOne({_id}),
    });

    if (error) {
      return next(GeneralErrorsFactory.badRequestErr());
    }

    if (!response) {
      return next(GeneralErrorsFactory.notFoundErr());
    }

    req.preparedObj = {
      [key]: response,
    };
    next();
  };
