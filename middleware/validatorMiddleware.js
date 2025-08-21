const {GeneralErrorsFactory} = require('../factories');
const {asyncTryCatch} = require('../utils/tryCatchUtils');

module.exports =
  ({validateFunction, reqProperty = 'body', options = {}}) =>
  async (req, res, next) => {
    const source = req[reqProperty];

    const context = {req, options};

    const {
      success,
      response: validationResult,
      error,
    } = await asyncTryCatch({
      fn: () => validateFunction({data: source, context}),
    });

    if (!success) return res.status(500).send(error);

    if (validationResult?.errors) {
      return next(
        GeneralErrorsFactory.badRequestErr({
          customMessage: validationResult.errors,
        })
      );
    }

    // Replace the original request property with the validated parameters
    if (validationResult?.parameters)
      req[reqProperty] = validationResult.parameters;

    next();
  };
