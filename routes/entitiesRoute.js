const express = require('express');

const {SYSTEM_ENTITIES} = require('../constants/aclConstants');
const {GeneralController, EntitiesController} = require('../controllers');
const {validatorMiddleware, aclAccessMiddleware} = require('../middleware');
const EntitiesModel = require('../models/EntitiesModel');
const {entitiesSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = express.Router();

const SINGULAR_KEY = 'entity';

/*
const options = {
  // --> Find Options or Find and Update Options
  // --------> Find One or Find Many Options
  fieldsInclusion: {
    exclude: [''], // Array of field names to exclude from the response. Example: ['verificationToken'] . no need to add fields that are marked as `select: false` in the schema as they are excluded by default.
    include: [''], // Array of fields that are marked as `select: false` in the schema but should be included in the response. Example: ['password', 'createdAt', 'updatedAt'].
    includeSpecificFields: [''], // If provided, only these specific fields will be included in the response, ignoring `exclude` and `include` options. Example: ['_id', 'name', 'email'].
  },
  populateFields: '',
  includeDeleted: false, //Set to true if you want to include soft deleted records by default its value is false
  // --------> Find One or Find One and Update Options
  // No specific options for single record find
  // --------> Find Many or Find Many and Update Options
  queryProperties: {}, //Pass the query properties you want to apply on the query e.g {sort:'-createdAt'} etc it is only used in find *

  // Delete Options
  hardDelete: false, //Set to true if you want to hard delete the record by default its value is false and used in findOneAndDelete , findByIdAndDelete , deleteOne , deleteMany and findAllAndDelete
};
*/

// *: "Options marked with * above are configured for specific operations only. Refer to the MongoFactory file for exact details. You can extend these options as needed."

router.post(
  '/',
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.entities.value,
    permissionKey: 'create',
  }),
  validatorMiddleware({
    validateFunction: entitiesSchema.validateCreateEntityBody,
    reqProperty: 'body',
  }),
  catchAsync(EntitiesController.create)
);

router.get(
  '/',
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.entities.value,
    permissionKey: 'view',
  }),
  catchAsync(EntitiesController.getAllEntities)
);

router.delete(
  '/:_id',
  validatorMiddleware({
    validateFunction: entitiesSchema.validateEntityIdParams,
    reqProperty: 'params',
  }),
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.entities.value,
    permissionKey: 'remove',
  }),
  catchAsync((req, res, next) => {
    GeneralController.deleteById({
      model: EntitiesModel,
      _id: req.params._id,
      key: SINGULAR_KEY,
      options: {hardDelete: true},
    })(req, res, next);
  })
);

router.patch(
  '/:_id',
  validatorMiddleware({
    validateFunction: entitiesSchema.validateEntityIdParams,
    reqProperty: 'params',
  }),
  validatorMiddleware({
    validateFunction: entitiesSchema.validateUpdateEntityBody,
    reqProperty: 'body',
  }),

  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.entities.value,
    permissionKey: 'update',
  }),
  catchAsync((req, res, next) => {
    GeneralController.updateById({
      model: EntitiesModel,
      _id: req.params._id,
      key: SINGULAR_KEY,
      data: req.body,
    })(req, res, next);
  })
);

router.patch(
  '/',
  validatorMiddleware({
    validateFunction: entitiesSchema.validateUpdateManyEntitiesBody,
  }),
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.entities.value,
    permissionKey: 'update',
    resourcesIdsValueORFunction: ({req}) => req.body.ids,
  }),
  catchAsync(EntitiesController.updateManyEntities)
);

router.delete(
  '/',
  validatorMiddleware({
    validateFunction: entitiesSchema.validateDeleteManyEntitiesBody,
  }),
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.entities.value,
    permissionKey: 'remove',
    resourcesIdsValueORFunction: ({req}) => req.body.ids,
  }),
  catchAsync(EntitiesController.deleteManyEntities)
);

module.exports = router;
