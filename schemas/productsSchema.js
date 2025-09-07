const Yup = require('yup');

const {
  PRODUCT_TRANSMISSION_TYPES_VALUES,
  PRODUCT_FUEL_TYPES_VALUES,
  PRODUCT_CONDITIONS_VALUES,
} = require('../constants/productConstants');
const {validatorUtils} = require('../utils');

module.exports.validateCreateProductRequest = ({data}) => {
  const schema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number().required('Price is required'),
    condition: Yup.string()
      .oneOf(PRODUCT_CONDITIONS_VALUES)
      .required('Condition is required'),
    location: Yup.string().required('Location is required'),
    brand: Yup.string().required('Brand is required'),
    model: Yup.string().required('Model is required'),
    year: Yup.number().required('Year is required'),
    mileage: Yup.number().required('Mileage is required'),
    fuelType: Yup.string()
      .oneOf(PRODUCT_FUEL_TYPES_VALUES)
      .required('Fuel type is required'),
    transmission: Yup.string()
      .oneOf(PRODUCT_TRANSMISSION_TYPES_VALUES)
      .required('Transmission is required'),
    engineCapacity: Yup.number(),
    color: Yup.string().required('Color is required'),
  });

  return validatorUtils.validate({schema, data});
};
