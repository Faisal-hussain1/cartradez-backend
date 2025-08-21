const AppError = require('./AppError');
const AuthErrors = require('./AuthErrors');
const GeneralErrorsFactory = require('./general');

const UsersErrorsFactory = require('../errors/users');

module.exports = {
  AppError,
  GeneralErrorsFactory,
  UsersErrorsFactory,
  AuthErrors,
};
