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

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns the information of the logged-in user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                   example: "User info retrieved successfully"
 *                 body:
 *                   type: object
 *                   description: The main content of the response
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Details of the logged-in user
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: Unique identifier of the user
 *                           example: "6718b50850537de87e6805e8"
 *                         firstName:
 *                           type: string
 *                           description: First name of the user
 *                           example: "Awais"
 *                         lastName:
 *                           type: string
 *                           description: Last name of the user
 *                           example: "Tahir"
 *                         email:
 *                           type: string
 *                           description: Email address of the user
 *                           example: "awais.tahir+1@desolint.com"
 *                         role:
 *                           type: string
 *                           description: Role of the user
 *                           example: "admin"
 *                         isVerified:
 *                           type: boolean
 *                           description: Indicates whether the user's email is verified
 *                           example: true
 *                         organizationId:
 *                           type: string
 *                           description: Unique identifier of the user's organization
 *                           example: "6718b50850537de87e6805e8"
 *                     type:
 *                       type: string
 *                       description: Type of response
 *                       example: "USER_INFO_RETRIEVED_SUCCESSFULLY"
 *       401:
 *         description: Unauthorized - Authentication is required or has failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Unauthorized - Invalid or missing token"
 *       403:
 *         description: Forbidden - The user does not have access to this resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 403
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Forbidden - Access denied"
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
  '/me',
  authMiddleware,
  catchAsync(UsersController.getLoggedInUserInformation)
);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     tags:
 *       - Users
 *     description: Logs in a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *                 example: "awais.tahir@desolint.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "yourpassword123"
 *     responses:
 *       200:
 *         description: Successful login
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
 *                   example: "User logged in successfully"
 *                 body:
 *                   type: object
 *                   description: The main content of the response
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Details of the logged-in user
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: Unique identifier of the user
 *                           example: "6718b50850537de87e6805e8"
 *                         firstName:
 *                           type: string
 *                           description: First name of the user
 *                           example: "Awais"
 *                         lastName:
 *                           type: string
 *                           description: Last name of the user
 *                           example: "Tahir"
 *                         email:
 *                           type: string
 *                           description: Email address of the user
 *                           example: "awais.tahir@desolint.com"
 *                         role:
 *                           type: string
 *                           description: Role of the user
 *                           example: "admin"
 *                         isVerified:
 *                           type: boolean
 *                           description: Indicates whether the user's email is verified
 *                           example: true
 *                     type:
 *                       type: string
 *                       description: Type of response
 *                       example: "USER_LOGGED_IN_SUCCESSFULLY"
 *       400:
 *         description: Bad Request - Invalid email or password format
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
 *                   example: "Invalid email or password format"
 *       401:
 *         description: Unauthorized - Wrong email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Wrong email or password"
 *       403:
 *         description: Forbidden - User not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 403
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "User is not verified"
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
  '/login',
  validatorMiddleware({
    validateFunction: usersSchema.validateLoginRequest,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.loginUser)
);

/**
 * @swagger
 * /api/v1/users/signup:
 *   post:
 *     tags:
 *       - Users
 *     description: Registers a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name of the user
 *                 example: "Awais"
 *               lastName:
 *                 type: string
 *                 description: Last name of the user
 *                 example: "Tahir"
 *               email:
 *                 type: string
 *                 description: User's email
 *                 example: "awais.tahir@desolint.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "yourpassword123"
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: "User registered successfully"
 *       400:
 *         description: Bad Request - Validation failed or user already registered
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
 *                   example: "User already registered with this email"
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
  '/signup',
  validatorMiddleware({
    validateFunction: usersSchema.validateCreateRequest,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.createUser)
);

/**
 * @swagger
 * /api/v1/users/forgot-password:
 *   post:
 *     tags:
 *       - Users
 *     description: Requests a password reset link for the user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user requesting the reset
 *                 example: "awais.tahir@desolint.com"
 *     responses:
 *       200:
 *         description: Password reset link generated successfully
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
 *                   example: "Password reset link generated successfully"
 *                 body:
 *                   type: object
 *                   description: The main content of the response
 *                   properties:
 *                     resetToken:
 *                       type: string
 *                       description: Password reset token
 *                       example: "e5f8a9b4acb45c7f8b6e7a5c"
 *                     resetUrl:
 *                       type: string
 *                       description: URL containing the reset token for password reset
 *                       example: "https://yourfrontend.com/auth/reset/e5f8a9b4acb45c7f8b6e7a5c"
 *       404:
 *         description: User not found
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
 *                   description: Error message
 *                   example: "User not found"
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
  '/forgot-password',
  validatorMiddleware({
    validateFunction: usersSchema.validateEmail,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.forgetPassword)
);

/**
 * @swagger
 * /api/v1/users/invite:
 *   post:
 *     tags:
 *       - Users
 *     description: Invite a new user by email and assign a role. If the email is already registered, it returns an error.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user to invite
 *                 example: "user@example.com"
 *               role:
 *                 type: string
 *                 description: Role to assign to the invited user
 *                 example: "employee"
 *     responses:
 *       201:
 *         description: User invited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "User invited successfully"
 *                 body:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "userInvitedSuccessfully"
 *       409:
 *         description: User is already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "User is already registered"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

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

/**
 * @swagger
 * /api/v1/users/verify/{token}:
 *   post:
 *     tags:
 *       - Users
 *     description: Verifies an invited user using the invitation token, sets their password, first name, and last name
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token provided to the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: Password for the new user account
 *                 example: "StrongP@ssw0rd!"
 *               firstName:
 *                 type: string
 *                 description: First name of the user
 *                 example: "New"
 *               lastName:
 *                 type: string
 *                 description: Last name of the user
 *                 example: "User"
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "User verified successfully"
 *                 body:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "userVerifiedSuccessfully"
 *       404:
 *         description: Invitation token not found or already used
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "User is already registered"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post(
  '/verify/:token',
  validatorMiddleware({
    validateFunction: usersSchema.validateVerifyInvitedUserRequest,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.verifyInvitedUser)
);

/**
 * @swagger
 * /api/v1/users/reset/{token}:
 *   patch:
 *     tags:
 *       - Users
 *     description: Resets the user's password using a reset token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: New password for the user
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: "Password reset successfully"
 *       400:
 *         description: Bad Request - Invalid token or password format
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
 *                   example: "Invalid reset token"
 *       404:
 *         description: User not found
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
 *                   description: Error message
 *                   example: "User not found for this reset token"
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
  '/reset/:token',
  validatorMiddleware({
    validateFunction: usersSchema.validateResetPasswordRequest,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.resetPassword)
);

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     tags:
 *       - Users
 *     description: Logs out the user by clearing the session or token
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
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
 *                   description: A message indicating successful logout
 *                   example: "Successfully logged out"
 *       401:
 *         description: Unauthorized - User not logged in or invalid session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "User not logged in"
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

router.post('/logout', catchAsync(UsersController.logout));

/**
 * @swagger
 * /api/v1/users/verify/new/{token}:
 *   post:
 *     tags:
 *       - Users
 *     description: Verifies a user's email with a verification token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token for email verification
 *     responses:
 *       200:
 *         description: User verified successfully
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
 *                   description: A message indicating successful verification
 *                   example: "User verified successfully"
 *       400:
 *         description: Bad Request - Invalid or expired token
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
 *                   example: "Invalid or expired verification token"
 *       409:
 *         description: Conflict - User already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 409
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "User is already verified"
 *       404:
 *         description: User not found
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
 *                   description: Error message
 *                   example: "User not found"
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

router.post('/verify/new/:token', catchAsync(UsersController.verifyUser));

/**
 * @swagger
 * /api/v1/users/verify/refresh:
 *   post:
 *     tags:
 *       - Users
 *     description: Requests a new email verification token for the user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user requesting a new verification token
 *                 example: "awais.tahir@desolint.com"
 *     responses:
 *       200:
 *         description: Verification email sent successfully
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
 *                   description: A message indicating successful resend of verification email
 *                   example: "Verification email resent successfully"
 *       400:
 *         description: Bad Request - Invalid request or user already verified
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
 *                   example: "Invalid request or user is already verified"
 *       404:
 *         description: User not found
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
 *                   description: Error message
 *                   example: "User not found"
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
  '/verify/refresh',
  validatorMiddleware({
    validateFunction: usersSchema.validateEmail,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.regenerateVerifyToken)
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     description: Retrieves a list of all users
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: User ID
 *                         example: "65e8a7b63f9e2b001f6c4a5a"
 *                       firstName:
 *                         type: string
 *                         description: User's first name
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         description: User's last name
 *                         example: "Doe"
 *                       email:
 *                         type: string
 *                         description: User's email address
 *                         example: "john.doe@example.com"
 *                       currentRole:
 *                         type: string
 *                         description: User's role
 *                         example: "admin"
 *                       isVerified:
 *                         type: boolean
 *                         description: Whether the user is verified
 *                         example: true
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Unauthorized access"
 *       403:
 *         description: Forbidden - User lacks necessary permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 403
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Access denied"
 *       500:
 *         description: Internal Server Error - Unexpected error occurred
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

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     description: Deletes a user by their ID. Requires authentication.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user to be deleted
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   description: A message indicating successful deletion of the user
 *                   example: "User deleted successfully"
 *       400:
 *         description: Bad Request - Invalid or missing user ID
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
 *                   example: "Invalid or missing user ID"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Unauthorized access"
 *       404:
 *         description: User not found
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
 *                   description: Error message
 *                   example: "User not found"
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

/**
 * @swagger
 * /api/v1/users/language:
 *   patch:
 *     tags:
 *       - Users
 *     description: Updates the language preference for the authenticated user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 description: Language code for the user's preferred language
 *                 example: "en"
 *     responses:
 *       200:
 *         description: Language updated successfully
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
 *                   description: A message indicating successful language update
 *                   example: "Language updated successfully"
 *                 body:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: Unique identifier of the user
 *                           example: "687e2ed39bed636f04602a20"
 *                         firstName:
 *                           type: string
 *                           description: First name of the user
 *                           example: "Ahmad"
 *                         lastName:
 *                           type: string
 *                           description: Last name of the user
 *                           example: "Zahid"
 *                         email:
 *                           type: string
 *                           description: Email address of the user
 *                           example: "ahmadzahid2256@gmail.com"
 *                         isVerified:
 *                           type: boolean
 *                           description: Whether the user's email is verified
 *                           example: true
 *                         deletedAt:
 *                           type: string
 *                           nullable: true
 *                           description: Deletion timestamp (null if not deleted)
 *                           example: null
 *                         verificationToken:
 *                           type: string
 *                           description: JWT token for user verification
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODdlMmVkMzliZWQ2MzZmMDQ2MDJhMjAiLCJlbWFpbCI6ImFobWFkemFoaWQyMjU2QGdtYWlsLmNvbSIsImlhdCI6MTc1MzA5OTk4NywiZXhwIjoxNzUzMTAzNTg3fQ.xZdcfEoAibhqeoLZUwM7WtgG3P_AF4H2z2Z4yQXsopI"
 *                         language:
 *                           type: string
 *                           description: Updated language preference of the user
 *                           example: "en"
 *                         organizationId:
 *                           type: string
 *                           nullable: true
 *                           description: Organization ID (null if not associated with any organization)
 *                           example: null
 *                     type:
 *                       type: string
 *                       description: Type of operation performed
 *                       example: "LANGUAGE_UPDATED_SUCCESSFULLY"
 *       400:
 *         description: Bad Request - Language is required or invalid request
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
 *                   example: "Language is required"
 *                 error:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       description: Error type
 *                       example: "BAD_REQUEST"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Unauthorized access"
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
  '/language',
  authMiddleware,
  validatorMiddleware({
    validateFunction: usersSchema.validateLanguage,
    reqProperty: 'body',
  }),
  catchAsync(UsersController.updateUserLanguage)
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     tags:
 *       - Users
 *     description: Updates a user's information by their ID. Requires authentication.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Updated first name of the user
 *                 example: "UpdatedFirstName"
 *               lastName:
 *                 type: string
 *                 description: Updated last name of the user
 *                 example: "UpdatedLastName"
 *               email:
 *                 type: string
 *                 description: Updated email of the user
 *                 example: "updated.email@example.com"
 *               role:
 *                 type: string
 *                 description: Updated role of the user
 *                 example: "manager"
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   description: A message indicating successful update of the user
 *                   example: "User updated successfully"
 *       400:
 *         description: Bad Request - Invalid or missing user data
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
 *                   example: "Invalid user data"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Unauthorized access"
 *       404:
 *         description: User not found
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
 *                   description: Error message
 *                   example: "User not found"
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

module.exports = router;
