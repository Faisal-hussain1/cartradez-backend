const AppResponse = require('./AppResponse');

const {
  PRODUCT_SUCCESS_TYPES,
} = require('../../constants/responses/success/products');

module.exports = class ProductsResponsesFactory {
  constructor() {}

  static productAddedSuccessfully() {
    return new AppResponse({
      message: 'Product added successfully',
      statusCode: 201,
      body: {type: PRODUCT_SUCCESS_TYPES.productAddedSuccessfully.value},
    });
  }

  static productsRetrievedSuccessfully({products}) {
    return new AppResponse({
      message: 'Products retrieved successfully',
      statusCode: 200,
      body: {
        products,
        type: PRODUCT_SUCCESS_TYPES.productsRetrievedSuccessfully.value,
      },
    });
  }
};
