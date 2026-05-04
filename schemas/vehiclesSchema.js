const Yup = require('yup');

const {
  VEHICLE_TRANSMISSION_TYPES_VALUES,
  VEHICLE_FUEL_TYPES_VALUES,
  VEHICLE_CURRENCY_TYPES_VALUES,
  VEHICLE_MAKES_VALUES,
  VEHICLE_CONDITIONS_VALUES,
  VEHICLE_DRIVE_VALUES,
  VEHICLE_BODIES_VALUES,
} = require('../constants/vehicleConstants');
const {validatorUtils} = require('../utils');

module.exports.validateCreateVehicleRequest = ({data}) => {
  if (typeof data.features === "string") {
  try {
    data.features = JSON.parse(data.features);
  } catch (err) {
    data.features = [];
  }
}

if (!Array.isArray(data.features)) {
  data.features = [];
}

  const schema = Yup.object().shape({
    make: Yup.string()
      .required('Vehicle make is required'),
    model: Yup.string().required('Vehicle model is required'),
    variant: Yup.string(),
    year: Yup.number().required('Vehicle year is required'),
    condition: Yup.string(),
    bodyType: Yup.string(),
    color: Yup.string(),
    mileage: Yup.number(),
    engineSize: Yup.number(),
    transmission: Yup.string(),
    fuelType: Yup.string(),
    driveType: Yup.string(),
    currency: Yup.string().oneOf(VEHICLE_CURRENCY_TYPES_VALUES),
    price: Yup.number().required('Price is required'),
    registrationCity: Yup.string(),
    registrationYear: Yup.string(),
    registrationNumber: Yup.string(),
    numberOfOwners: Yup.string(),
    description: Yup.string(),
    features: Yup.array().of(Yup.string()),
  });

  return validatorUtils.validate({schema, data});
};
