const AppError = require('./AppError');

const {
  GENERAL_ERROR_TYPES,
} = require('../../constants/responses/errors/general');

module.exports = class GeneralErrorsFactory {
  static invalidTokenErr({customMessage} = {}) {
    return new AppError({
      message: customMessage || 'invalid token',
      error: {type: GENERAL_ERROR_TYPES.invalidToken.value},
      statusCode: 401,
    });
  }

  static badRequestErr({customMessage} = {}) {
    return new AppError({
      message: customMessage || 'bad request',
      error: {type: GENERAL_ERROR_TYPES.badRequest.value},
      statusCode: 400,
    });
  }
  static notFoundErr({customMessage} = {}) {
    return new AppError({
      message: customMessage || 'not found',
      error: {type: GENERAL_ERROR_TYPES.notFound.value},
      statusCode: 404,
    });
  }

  static internalErr({customMessage, statusCode} = {}) {
    return new AppError({
      message: customMessage || 'Something went wrong',
      statusCode: statusCode || 500,
      submitToSentry: true,
      error: {type: GENERAL_ERROR_TYPES.internalError.value},
    });
  }

  static missingObjectId() {
    return new AppError({
      message: 'ID missing. Please provide and id',
      error: {type: GENERAL_ERROR_TYPES.missingObjectId.value},
      statusCode: 400,
    });
  }

  static invalidObjectId() {
    return new AppError({
      message: 'ID invalid. Please provide a valid ID',
      error: {type: GENERAL_ERROR_TYPES.invalidObjectId.value},
      statusCode: 400,
    });
  }

  static tooManyRequestsErr() {
    return new AppError({
      message: 'Too many requests. You are temporarily blocked.',
      error: {type: GENERAL_ERROR_TYPES.temporarilyBlocked.value},
      statusCode: 429,
    });
  }

  static fileTypeNotAllowedErr({allowedTypes}) {
    return new AppError({
      message: `Please upload only files of type: ${allowedTypes}`,
      statusCode: 400,
      error: {type: GENERAL_ERROR_TYPES.fileTypeNotAllowed.value},
    });
  }
  static fileNotFoundErr() {
    return new AppError({
      message: `No file was uploaded. Please upload a file.`,
      statusCode: 400,
      error: {type: GENERAL_ERROR_TYPES.fileNotFound.value},
    });
  }
};
