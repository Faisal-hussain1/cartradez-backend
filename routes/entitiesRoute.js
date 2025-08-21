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

/**
 * @swagger
 * /api/v1/entities:
 *   post:
 *     tags:
 *       - Entities
 *     description: Creates a new entity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the entity
 *                 example: "Sample Entity"
 *               description:
 *                 type: string
 *                 description: Description of the entity
 *                 example: "This is a sample entity description."
 *     responses:
 *       201:
 *         description: Entity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 201
 *                 message:
 *                   type: string
 *                   description: A message describing the result of the operation
 *                   example: "Entity created successfully"
 *                 body:
 *                   type: object
 *                   description: The created entity object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique identifier of the entity
 *                       example: "6718b50850537de87e6805e8"
 *                     name:
 *                       type: string
 *                       description: Name of the entity
 *                       example: "Sample Entity"
 *                     description:
 *                       type: string
 *                       description: Description of the entity
 *                       example: "This is a sample entity description."
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date and time when the entity was created
 *                       example: "2023-10-30T08:52:39.018Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date and time when the entity was last updated
 *                       example: "2023-10-30T08:52:39.018Z"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Validation failed for entity creation"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */

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

/**
 * @swagger
 * /api/v1/entities:
 *   get:
 *     tags:
 *       - Entities
 *     description: Retrieves all entities
 *     responses:
 *       200:
 *         description: A list of entities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: A message describing the result of the operation
 *                   example: "Entities retrieved successfully"
 *                 body:
 *                   type: array
 *                   description: List of entities
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Unique identifier of the entity
 *                         example: "6718b50850537de87e6805e8"
 *                       title:
 *                         type: string
 *                         description: Title of the entity
 *                         example: "Sample Entity Title"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the entity was created
 *                         example: "2023-10-30T08:52:39.018Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the entity was last updated
 *                         example: "2023-10-30T08:52:39.018Z"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */

router.get(
  '/',
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.entities.value,
    permissionKey: 'view',
  }),
  catchAsync(EntitiesController.getAllEntities)
);

/**
 * @swagger
 * /api/v1/entities/{_id}:
 *   delete:
 *     tags:
 *       - Entities
 *     description: Deletes an entity by its ID
 *     parameters:
 *       - name: _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the entity to delete
 *     responses:
 *       200:
 *         description: Entity deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: A message confirming successful deletion
 *                   example: "Entity deleted successfully"
 *                 body:
 *                   type: object
 *                   description: Details of the deleted entity
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique identifier of the entity
 *                       example: "6718b50850537de87e6805e8"
 *                     title:
 *                       type: string
 *                       description: Title of the entity
 *                       example: "Sample Entity Title"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date and time when the entity was created
 *                       example: "2023-10-30T08:52:39.018Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date and time when the entity was last updated
 *                       example: "2023-10-30T08:52:39.018Z"
 *       404:
 *         description: Not Found - The specified entity does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 404
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the entity was not found
 *                   example: "Entity not found"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */

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

/**
 * @swagger
 * /api/v1/entities/{_id}:
 *   patch:
 *     tags:
 *       - Entities
 *     description: Updates an entity by its ID
 *     parameters:
 *       - name: _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the entity to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title of the entity
 *                 example: "Updated Entity Title"
 *               description:
 *                 type: string
 *                 description: Updated description of the entity
 *                 example: "This is an updated description of the entity."
 *     responses:
 *       200:
 *         description: Entity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: A message confirming successful update
 *                   example: "Entity updated successfully"
 *                 body:
 *                   type: object
 *                   description: Details of the updated entity
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique identifier of the entity
 *                       example: "6718b50850537de87e6805e8"
 *                     title:
 *                       type: string
 *                       description: Title of the entity
 *                       example: "Updated Entity Title"
 *                     description:
 *                       type: string
 *                       description: Description of the entity
 *                       example: "This is an updated description of the entity."
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date and time when the entity was created
 *                       example: "2023-10-30T08:52:39.018Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date and time when the entity was last updated
 *                       example: "2023-10-31T08:52:39.018Z"
 *       404:
 *         description: Not Found - The specified entity does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 404
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the entity was not found
 *                   example: "Entity not found"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Validation failed for entity update"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */

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
