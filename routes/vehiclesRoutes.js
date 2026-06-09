const express = require('express');
const {ALLOWED_FILE_TYPES} = require('../constants/vehicleConstants');
const {VehiclesController} = require('../controllers');
const {
  validatorMiddleware,
  fileUploadMiddleware,
  authMiddleware,
  accessMiddleware,
  vehicleReadLimiter,
} = require('../middleware');
const {vehiclesSchema} = require('../schemas');
const {catchAsync} = require('../utils');
const {checkAllowedRoles} = require('../utils/validatorUtils');
const {SYSTEM_ROLES} = require('../constants/usersConstants');

const router = express.Router();

const allowedRoles = accessMiddleware({
  customFn: checkAllowedRoles({
    allowedRoles: [
      SYSTEM_ROLES.admin.value,
      SYSTEM_ROLES.user.value,
      SYSTEM_ROLES.dealer.value,
    ],
  }),
});

const adminOnly = accessMiddleware({
  customFn: checkAllowedRoles({
    allowedRoles: [SYSTEM_ROLES.admin.value],
  }),
});

// ─── STATIC / SPECIFIC PATHS FIRST ──────────────────────────────────────────
// IMPORTANT: Express matches routes top-to-bottom. All static segments (/add,
// /cartradez, /user/:id) MUST come before the wildcard /:id routes, otherwise
// GET /cartradez would be captured by GET /:id and never reach its handler.

router.post(
  '/add',
  authMiddleware,
  allowedRoles,
  fileUploadMiddleware({allowedTypes: ALLOWED_FILE_TYPES, multiple: true, maxFiles: 9}),
  validatorMiddleware({validateFunction: vehiclesSchema.validateCreateVehicleRequest, reqProperty: 'body'}),
  catchAsync(VehiclesController.addNewVehicle)
);

router.get(
  '/stats/active-listings-count',
  authMiddleware,
  catchAsync(VehiclesController.getActiveListingsCount)
);

router.get(
  '/stats/managed-by-cartradez-count',
  authMiddleware,
  catchAsync(VehiclesController.getManagedByCartradezCount)
);

router.get(
  '/stats/dashboard-vehicle-stats',
  authMiddleware,
  catchAsync(VehiclesController.getDashboardVehicleStats)
);

router.get(
  '/cartradez',
  catchAsync(VehiclesController.getAllManagedByCartradezVehicles)
);

router.get(
  '/user/:id',
  authMiddleware,
  catchAsync(VehiclesController.getAllVehiclesOfLoggedInUser)
);

router.get(
  '/deleted',
  authMiddleware,
  adminOnly,
  catchAsync(VehiclesController.getDeletedVehicles)
);

router.patch(
  '/:id/restore',
  authMiddleware,
  adminOnly,
  catchAsync(VehiclesController.restoreVehicle)
);

router.delete(
  '/:id/permanent',
  authMiddleware,
  adminOnly,
  catchAsync(VehiclesController.permanentlyDeleteVehicle)
);

// ─── ROOT LIST ───────────────────────────────────────────────────────────────
router.get('/', vehicleReadLimiter, catchAsync(VehiclesController.getAllVehicles));

// ─── WILDCARD /:id ROUTES LAST ───────────────────────────────────────────────
router.get('/:id', vehicleReadLimiter, catchAsync(VehiclesController.getVehicle));

router.patch(
  '/:id',
  authMiddleware,
  allowedRoles,
  fileUploadMiddleware({allowedTypes: ALLOWED_FILE_TYPES, multiple: true, maxFiles: 9, require: false}),
  catchAsync(VehiclesController.updateVehicle)
);

router.delete(
  '/:id',
  authMiddleware,
  allowedRoles,
  catchAsync(VehiclesController.deleteVehicle)
);

module.exports = router;
