const express = require('express');

const {ALLOWED_FILE_TYPES} = require('../constants/productConstants');
const {SYSTEM_ROLES} = require('../constants/usersConstants');
const {ProductsController} = require('../controllers');

const {
  accessMiddleware,
  validatorMiddleware,
  fileUploadMiddleware,
  authMiddleware,
} = require('../middleware');
const {productsSchema} = require('../schemas');
const {catchAsync} = require('../utils');
const {checkAllowedRoles} = require('../utils/validatorUtils');

const router = express.Router();

router.post(
  '/add',
  authMiddleware,
  accessMiddleware({
    customFn: checkAllowedRoles({
      allowedRoles: [SYSTEM_ROLES.admin.value, SYSTEM_ROLES.user.value],
    }),
  }),
  fileUploadMiddleware({
    allowedTypes: ALLOWED_FILE_TYPES,
    multiple: true,
  }),
  validatorMiddleware({
    validateFunction: productsSchema.validateCreateProductRequest,
    reqProperty: 'body',
  }),
  catchAsync(ProductsController.addNewProduct)
);

router.get('/', catchAsync(ProductsController.getAllProducts));

module.exports = router;
