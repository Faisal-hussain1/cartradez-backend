const Yup = require('yup');

const {
  VEHICLE_TRANSMISSION_TYPES_VALUES,
  VEHICLE_FUEL_TYPES_VALUES,
  VEHICLE_CURRENCY_TYPES_VALUES,
  VEHICLE_MAKES_VALUES,
  VEHICLE_MODELS_VALUES,
} = require('../constants/vehicleConstants');
const {validatorUtils} = require('../utils');

module.exports.validateCreateVehicleRequest = ({data}) => {
  const schema = Yup.object().shape({
    make: Yup.string()
      .required('Vehicle make is required')
      .oneOf(VEHICLE_MAKES_VALUES),
    model: Yup.string()
      .required('Vehicle model is required')
      .oneOf(VEHICLE_MODELS_VALUES),
    year: Yup.number().required('Vehicle year is required'),
    color: Yup.string().required('Vehicle color is required'),
    mileage: Yup.number().required('Vehicle Mileage is required'),
    price: Yup.number().required('Price is required'),
    currency: Yup.string().oneOf(VEHICLE_CURRENCY_TYPES_VALUES),
    description: Yup.string().required('Vehicle description is required'),
    engineSize: Yup.number().required('Vehicle Engine Type is required'),
    fuelType: Yup.string()
      .oneOf(VEHICLE_FUEL_TYPES_VALUES)
      .required('Vehicle fuel type is required'),
    transmission: Yup.string()
      .oneOf(VEHICLE_TRANSMISSION_TYPES_VALUES)
      .required('Vehicle transmission is required'),

    // seats: Yup.number(),
    // doors: Yup.string().oneOf(VEHICLE_DOORS_VALUES),
    // numberPlate: Yup.string().required('Vehicle number plate is required'),
    // cylinder: Yup.string(),
    // location: Yup.string(),
    // modelDetail: Yup.string(),
    // importHistory: Yup.string(),
  });

  return validatorUtils.validate({schema, data});
};
