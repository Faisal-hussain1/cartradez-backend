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
  data.features = JSON.parse(data.features) || [];

  const schema = Yup.object().shape({
    make: Yup.string()
      .required('Vehicle make is required')
      .oneOf(VEHICLE_MAKES_VALUES),
    model: Yup.string().required('Vehicle model is required'),
    variant: Yup.string(),
    year: Yup.number().required('Vehicle year is required'),
    condition: Yup.string()
      .required('Vehicle condition is required')
      .oneOf(VEHICLE_CONDITIONS_VALUES),
    bodyType: Yup.string()
      .required('Vehicle body type is required')
      .oneOf(VEHICLE_BODIES_VALUES),
    color: Yup.string().required('Vehicle color is required'),
    mileage: Yup.number().required('Vehicle Mileage is required'),
    engineSize: Yup.number().required('Vehicle Engine Type is required'),
    transmission: Yup.string()
      .oneOf(VEHICLE_TRANSMISSION_TYPES_VALUES)
      .required('Vehicle transmission is required'),
    fuelType: Yup.string()
      .oneOf(VEHICLE_FUEL_TYPES_VALUES)
      .required('Vehicle fuel type is required'),
    driveType: Yup.string()
      .required('Vehicle drive type is required')
      .oneOf(VEHICLE_DRIVE_VALUES),
    currency: Yup.string().oneOf(VEHICLE_CURRENCY_TYPES_VALUES),
    price: Yup.number().required('Price is required'),
    registrationCity: Yup.string().required('Registration city is required'),
    registrationYear: Yup.number().required('Registration year is required'),
    registrationNumber: Yup.string().required(
      'Registration number is required'
    ),
    numberOfOwners: Yup.number().required('Number of owners is required'),

    description: Yup.string().required('Vehicle description is required'),
    features: Yup.array().of(Yup.string()),
  });

  return validatorUtils.validate({schema, data});
};
