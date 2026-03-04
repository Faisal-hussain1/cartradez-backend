const express = require('express');

const {
  accessConstants: {SYSTEM_ENTITIES},
} = require('../constants');
const {UsersController, GeneralController} = require('../controllers');

const {
  validatorMiddleware,
  authMiddleware,
  aclAccessMiddleware,
} = require('../middleware');
const {UsersModel} = require('../models');
const {usersSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = express.Router();

router.get(
  '/me',
  authMiddleware,
  catchAsync(UsersController.getLoggedInUserInformation)
);

router.post(
  '/login',
  validatorMiddleware({
    validateFunction: usersSchema.validateLoginRequest,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.loginUser)
);

router.post(
  '/signup',
  validatorMiddleware({
    validateFunction: usersSchema.validateCreateRequest,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.createUser)
);

router.post(
  '/forgot-password',
  validatorMiddleware({
    validateFunction: usersSchema.validateEmail,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.forgetPassword)
);

router.post(
  '/invite',
  authMiddleware,
  validatorMiddleware({
    validateFunction: usersSchema.validateInviteUserRequest,
    reqProperty: 'body',
  }),
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.users.value,
    permissionKey: 'inviteUser',
  }),
  catchAsync(UsersController.inviteUser)
);

router.post(
  '/verify/:token',
  validatorMiddleware({
    validateFunction: usersSchema.validateVerifyInvitedUserRequest,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.verifyInvitedUser)
);

router.patch(
  '/reset/:token',
  validatorMiddleware({
    validateFunction: usersSchema.validateResetPasswordRequest,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.resetPassword)
);

router.post('/logout', catchAsync(UsersController.logout));

router.post('/verify/new/:token', catchAsync(UsersController.verifyUser));

router.post(
  '/verify/refresh',
  validatorMiddleware({
    validateFunction: usersSchema.validateEmail,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.regenerateVerifyToken)
);

router.get(
  '/',
  authMiddleware,
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.users.value,
    permissionKey: 'view',
  }),
  catchAsync((req, res, next) => {
    GeneralController.findAll({
      model: UsersModel,
      key: 'Users',
    })(req, res, next);
  })
);

router.delete(
  '/:_id',
  authMiddleware,
  validatorMiddleware({
    validateFunction: usersSchema.validateUserIdParams,
    reqProperty: 'params',
  }),
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.users.value,
    permissionKey: 'remove',
  }),
  catchAsync(UsersController.deleteUser)
);

router.patch(
  '/language',
  authMiddleware,
  validatorMiddleware({
    validateFunction: usersSchema.validateLanguage,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.updateUserLanguage)
);

router.patch(
  '/:_id',
  authMiddleware,
  validatorMiddleware({
    validateFunction: usersSchema.validateUserIdParams,
    reqProperty: 'params',
  }),
  aclAccessMiddleware({
    entityToCheck: SYSTEM_ENTITIES.users.value,
    permissionKey: 'update',
  }),
  validatorMiddleware({
    validateFunction: usersSchema.validateUpdateUserRequest,
    reqProperty: 'body',
  }),
  catchAsync((req, res, next) => {
    GeneralController.updateById({
      model: UsersModel,
      _id: req.params._id,
      key: 'User',
      data: req.body,
    })(req, res, next);
  })
);

router.patch(
  'dealer-form/:_id',
  authMiddleware,
  validatorMiddleware({
    validateFunction: usersSchema.validateUserIdParams,
    reqProperty: 'params',
  }),
  validatorMiddleware({
    validateFunction: usersSchema.validateUpdateUserRequest,
    reqProperty: 'body',
  }),
  catchAsync((req, res, next) => {
    GeneralController.updateById({
      model: UsersModel,
      _id: req.params._id,
      key: 'User',
      data: req.body,
    })(req, res, next);
  })
);

module.exports = router;
