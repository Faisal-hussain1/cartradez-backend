const {mongoose} = require('mongoose');

const {
  PRODUCT_CATEGORIES,
  PRODUCT_CURRENCY_TYPES,
  PRODUCT_STATUSES,
} = require('../constants/productConstants');
const {ProductsResponsesFactory} = require('../factories');
const ProductCategoriesModel = require('../models/ProductCategoriesModel');
const ProductsModel = require('../models/ProductsModel');
const {FileServices, GeneralServices} = require('../services');

module.exports = class ProductsController {
  static async addNewProduct(req, res, next) {
    const data = req.body;
    const loggedInUser = req.jwtToken.user;

    let session;
    let awsFileKeys = [];
    let createdProductId;
    let productImages = [];

    try {
      const {doc: retrievedCategory, error: categoryRetrievedError} =
        await GeneralServices.findOne({
          model: ProductCategoriesModel,
          query: {name: PRODUCT_CATEGORIES.car.value},
        });

      if (categoryRetrievedError) throw categoryRetrievedError;

      data.categoryId = retrievedCategory._id;
      data.sellerId = loggedInUser._id;
      data.currency = PRODUCT_CURRENCY_TYPES.usd.value;

      session = await mongoose.startSession();
      session.startTransaction();

      const {doc: createdProduct, error: productCreationError} =
        await GeneralServices.create({
          model: ProductsModel,
          data: data,
          session,
        });

      if (productCreationError) throw productCreationError;

      createdProductId = createdProduct._id;

      if (req?.files && req.files.length > 0) {
        let profileImage;
        for (const file of req.files) {
          profileImage = await FileServices.uploadSingleFile({
            file: file,
            fileDir: `profile-image_${createdProduct._id}`,
          });

          awsFileKeys.push(profileImage.key);
          productImages.push(profileImage);
        }
      }

      createdProduct.images = productImages;
      await createdProduct.save({session});

      await session.commitTransaction();
      session.endSession();

      return next(ProductsResponsesFactory.productAddedSuccessfully());
    } catch (error) {
      if (awsFileKeys.length > 0) {
        for (const awsFileKey of awsFileKeys) {
          await FileServices.deleteFile({
            key: `profile-image_${createdProductId}/${awsFileKey}`,
          });
        }
      }

      if (session) {
        await session.abortTransaction();
        session.endSession();
      }

      throw error;
    }
  }

  static async getAllProducts(req, res, next) {
    const {docs: retrievedProducts, error: productsRetrievedError} =
      await GeneralServices.find({
        model: ProductsModel,
        query: {status: PRODUCT_STATUSES.active.value},
      });

    if (productsRetrievedError) throw productsRetrievedError;

    return next(
      ProductsResponsesFactory.productsRetrievedSuccessfully({
        products: retrievedProducts,
      })
    );
  }
};
