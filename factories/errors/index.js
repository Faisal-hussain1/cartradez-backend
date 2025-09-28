const AppError = require('./AppError');
const AuthErrors = require('./AuthErrors');
const GeneralErrorsFactory = require('./general');

const UsersErrorsFactory = require('./users');
const VehiclesErrorsFactory = require('./vehicle');

module.exports = {
  AppError,
  GeneralErrorsFactory,
  UsersErrorsFactory,
  AuthErrors,
  VehiclesErrorsFactory,
};
