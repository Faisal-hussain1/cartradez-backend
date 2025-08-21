const config = require('config');
const mongoose = require('mongoose');

const {DEFAULT_LANGUAGE} = require('../constants/usersConstants');
const AppError = require('../factories/errors/AppError');

module.exports.isEnvProd =
  config.get('env') === config.get('envVariables.prod');

module.exports.isEnvDev = config.get('env') === config.get('envVariables.dev');

module.exports.corsOrigins = this.isEnvProd
  ? config.get('allowedOrigins').split(',')
  : true;

module.exports.createOptions = ({
  extraQueries = null,
  originalOptions = {},
}) => {
  return {
    ...originalOptions,
    extraQueries,
  };
};

const isValidObjectId = ({id}) => {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
};

module.exports.convertMongoIdsInQuery = ({query = {}}) => {
  const newQuery = {};

  for (const key in query) {
    const value = query[key];

    if (Array.isArray(value?.$in)) {
      newQuery[key] = {
        $in: value.$in.map((v) =>
          isValidObjectId({id: v})
            ? mongoose.Types.ObjectId.createFromHexString(v)
            : v
        ),
      };
    } else if (isValidObjectId({id: value})) {
      newQuery[key] = mongoose.Types.ObjectId.createFromHexString(value);
    } else {
      newQuery[key] = value;
    }
  }

  return newQuery;
};

module.exports.checkErrorType = ({error}) => {
  const isAppError = error instanceof AppError;
  const isError = error instanceof Error;

  return {isAppError, isError};
};

module.exports.generateUrl = ({
  path = '',
  locale = DEFAULT_LANGUAGE,
  params = '',
}) => {
  const domain = config.get('frontendURL');
  const segments = [domain, locale, path, params].filter(Boolean);
  const url = segments.join('/');

  return url;
};

module.exports.getLocaleFromCookie = ({req}) => {
  return (
    req?.jwtToken?.user?.language ||
    req?.cookies?.[config.get('locale')] ||
    DEFAULT_LANGUAGE
  );
};
