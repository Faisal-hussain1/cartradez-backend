const AppError = require('./AppError');

const {
  VEHICLE_ERRORS_TYPES,
} = require('../../constants/responses/errors/vehicles');

module.exports = class UsersErrorsFactory {
  static vehicleNotFoundErr() {
    return new AppError({
      message: 'Vehicle not found',
      statusCode: 404,
      error: {type: VEHICLE_ERRORS_TYPES.vehicleNotFound.value},
    });
  }

  static vehicleLessImagesErr() {
    return new AppError({
      message: 'Upload at least 3 images',
      statusCode: 400,
      error: {type: VEHICLE_ERRORS_TYPES.vehicleLessImages.value},
    });
  }

  static vehicleMoreImagesErr() {
    return new AppError({
      message: 'You can upload a maximum of 9 images',
      statusCode: 400,
      error: {type: VEHICLE_ERRORS_TYPES.vehicleMoreImages.value},
    });
  }
};
