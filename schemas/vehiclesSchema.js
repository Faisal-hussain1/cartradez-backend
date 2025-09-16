const Yup = require('yup');

const {
  VEHICLE_TRANSMISSION_TYPES_VALUES,
  VEHICLE_FUEL_TYPES_VALUES,
  VEHICLE_CONDITIONS_VALUES,
  CAR_TYPES_VALUES,
  VEHICLE_CURRENCY_TYPES_VALUES,
} = require('../constants/vehicleConstants');
const {validatorUtils} = require('../utils');

module.exports.validateCreateVehicleRequest = ({data}) => {
  const schema = Yup.object().shape({
    name: Yup.string().required('Name is required').oneOf(CAR_TYPES_VALUES),
    description: Yup.string().required('Description is required'),
    price: Yup.number().required('Price is required'),
    currency: Yup.string()
      .required('Currency is required')
      .oneOf(VEHICLE_CURRENCY_TYPES_VALUES),
    condition: Yup.string()
      .oneOf(VEHICLE_CONDITIONS_VALUES)
      .required('Condition is required'),
    location: Yup.string().required('Location is required'),
    brand: Yup.string().required('Brand is required'),
    model: Yup.string().required('Model is required'),
    year: Yup.number().required('Year is required'),
    mileage: Yup.number().required('Mileage is required'),
    fuelType: Yup.string()
      .oneOf(VEHICLE_FUEL_TYPES_VALUES)
      .required('Fuel type is required'),
    transmission: Yup.string()
      .oneOf(VEHICLE_TRANSMISSION_TYPES_VALUES)
      .required('Transmission is required'),
    engineCapacity: Yup.number(),
    color: Yup.string().required('Color is required'),
  });

  return validatorUtils.validate({schema, data});
};
