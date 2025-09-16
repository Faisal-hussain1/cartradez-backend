const {
  VEHICLES_SUCCESS_TYPES,
} = require('../../constants/responses/success/vehicles');
const AppResponse = require('./AppResponse');

module.exports = class VehiclesResponsesFactory {
  constructor() {}

  static vehicleAddedSuccessfully() {
    return new AppResponse({
      message: 'Vehicle added successfully',
      statusCode: 201,
      body: {type: VEHICLES_SUCCESS_TYPES.vehicleAddedSuccessfully.value},
    });
  }

  static vehiclesRetrievedSuccessfully({
    vehicles,
    count,
    page,
    limit,
    totalPages,
  }) {
    return new AppResponse({
      message: 'Vehicles retrieved successfully',
      statusCode: 200,
      body: {
        type: VEHICLES_SUCCESS_TYPES.vehiclesRetrievedSuccessfully.value,
        vehicles,
        pagination: {
          count,
          page,
          limit,
          totalPages,
        },
      },
    });
  }
};
