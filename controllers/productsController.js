const {mongoose} = require('mongoose');

const {generalConstant} = require('../constants');

const {
  PRODUCT_CATEGORIES,
  PRODUCT_CURRENCY_TYPES,
  PRODUCT_ACTIONS,
} = require('../constants/productConstants');
const {ProductsResponsesFactory} = require('../factories');
const ProductCategoriesModel = require('../models/ProductCategoriesModel');
const ProductsModel = require('../models/ProductsModel');
const {FileServices, GeneralServices} = require('../services');
const {getCurrentTimestamp} = require('../utils/dateUtils');
const {prepareProductsData} = require('../utils/productsUtils');

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
      data.creatorId = loggedInUser._id;
      data.currency = PRODUCT_CURRENCY_TYPES.usd.value;
      data.timestamps = getCurrentTimestamp();
      data.events = [
        {
          action: PRODUCT_ACTIONS.created.value,
          userId: loggedInUser._id,
          timestamp: getCurrentTimestamp(),
        },
      ];

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
    const limit =
      parseInt(req.query.limit) || generalConstant.paginationDefaults.limit;

    const page =
      parseInt(req.query.page) || generalConstant.paginationDefaults.page;

    const skip = (page - 1) * limit;

    const {count, error: countErr} = await GeneralServices.countDocuments({
      model: ProductsModel,
      query: {},
    });

    if (countErr) throw countErr;

    const query = {
      ...(req.query.search && {
        $or: [
          {
            title: {
              $regex: req.query.search.trim(),
              $options: 'i',
            },
          },
        ],
      }),
    };

    const {docs: retrievedProducts, error: productsRetrievedError} =
      await GeneralServices.find({
        model: ProductsModel,
        query,
        options: {
          ...req.getUsersInclusionOptions,
          queryProperties: {
            skip,
            limit,
            sort: {createdAt: -1},
          },
        },
      });

    if (productsRetrievedError) throw productsRetrievedError;

    const preparedProducts = prepareProductsData({
      data: retrievedProducts,
    });

    return next(
      ProductsResponsesFactory.productsRetrievedSuccessfully({
        products: preparedProducts,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      })
    );
  }
};
