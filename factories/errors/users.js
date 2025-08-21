const AppError = require('./AppError');

const {USER_ERRORS_TYPES} = require('../../constants/responses/errors/users');

module.exports = class UsersErrorsFactory {
  static userAlreadyRegisteredErr() {
    return new AppError({
      message: 'user already registered',
      statusCode: 409,
      error: {type: USER_ERRORS_TYPES.userAlreadyRegistered.value},
    });
  }

  static userNotFoundErr() {
    return new AppError({
      message: 'user not found',
      statusCode: 404,
      error: {type: USER_ERRORS_TYPES.userNotFound.value},
    });
  }

  static wrongEmailOrPasswordErr() {
    return new AppError({
      message: 'wrong credentials',
      statusCode: 401,
      error: {type: USER_ERRORS_TYPES.wrongEmailOrPassword.value},
    });
  }

  static loginResetTokenErr() {
    return new AppError({
      message:
        'Token is either expired or is invalid. Please create a new token and try again',
      statusCode: 401,
      error: {type: USER_ERRORS_TYPES.invalidResetToken.value},
    });
  }

  static loginResetTokenUserErr() {
    return new AppError({
      message:
        'Password reset failed. Either the reset link is already used or the user is deleted',
      statusCode: 400,
      error: {type: USER_ERRORS_TYPES.passwordResetFailed.value},
    });
  }

  static userNotVerifiedErr() {
    return new AppError({
      message: 'User Not Verified',
      statusCode: 400,
      error: {
        type: USER_ERRORS_TYPES.userNotVerified.value,
      },
    });
  }

  static userAlreadyVerifiedErr() {
    return new AppError({
      message: 'user already verified',
      statusCode: 400,
      error: {type: USER_ERRORS_TYPES.userAlreadyVerified.value},
    });
  }
};
