const express = require('express');

const {ALLOWED_FILE_TYPES} = require('../constants/vehicleConstants');
const {VehiclesController} = require('../controllers');

const {
  validatorMiddleware,
  fileUploadMiddleware,
  authMiddleware,
  accessMiddleware,
} = require('../middleware');
const {vehiclesSchema} = require('../schemas');
const {catchAsync} = require('../utils');
const {checkAllowedRoles} = require('../utils/validatorUtils');
const {SYSTEM_ROLES} = require('../constants/usersConstants');

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
    validateFunction: vehiclesSchema.validateCreateVehicleRequest,
    reqProperty: 'body',
  }),
  catchAsync(VehiclesController.addNewVehicle)
);

router.get('/', catchAsync(VehiclesController.getAllVehicles));

router.get(
  '/cartradez',
  catchAsync(VehiclesController.getAllManagedByCartradezVehicles)
);

router.get('/:id', catchAsync(VehiclesController.getVehicle));

module.exports = router;
