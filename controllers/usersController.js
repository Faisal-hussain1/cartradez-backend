const config = require('config');
const mongoose = require('mongoose');

const {usersConstants, accessConstants} = require('../constants');

const {
  UsersErrorsFactory,
  GeneralErrorsFactory,
  UsersResponsesFactory,
  GeneralResponsesFactory,
} = require('../factories');
const {PermissionsModel, UsersModel} = require('../models');
const {UsersServices, GeneralServices} = require('../services');
const {jwtUtils, createOptions, getLocaleFromCookie} = require('../utils');
const actions = require('../utils/actions');
const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const {getCookieDomain} = require('../utils/urlUtils');

module.exports = class UsersController {
  static async createUser(req, res, next) {
    const data = req.body;

    let session = null;

    try {
      const {user: existingUser, error} = await UsersServices.getUserByEmail({
        email: data.email,
      });

      if (error) throw error;

      if (existingUser) throw UsersErrorsFactory.userAlreadyRegisteredErr();

      session = await mongoose.startSession();
      session.startTransaction();

      const {user: createdUser, error: userCreationError} =
        await UsersServices.createUser({
          data,
          session,
        });

      if (userCreationError) throw userCreationError;

      createdUser.generateVerificationToken();

      const {error: organizationError, organization} =
        await UsersServices.createUserOrganization({
          organizationData: {
            organizationName: `${data.firstName}'s Organization`,
            creatorId: createdUser._id,
          },
          session,
        });

      if (organizationError) throw organizationError;

      const organizationId = organization._id;

      const {doc: permissions, error: createPermissionError} =
        await GeneralServices.create({
          model: PermissionsModel,
          data: {
            userId: createdUser._id,
            organizationId,
            levels: {
              users: {
                view: [accessConstants.ACCESS_LEVELS.none],
                update: [accessConstants.ACCESS_LEVELS.none],
              },
              products: {
                view: [accessConstants.ACCESS_LEVELS.all],
                update: [],
                remove: [accessConstants.ACCESS_LEVELS.none],
              },
            },
          },
          session,
        });

      if (createPermissionError) throw createPermissionError;

      createdUser.organizations.push({
        organizationId,
        permissions: permissions._id,
        role: usersConstants.SYSTEM_ROLES.user.value,
        isActive: true,
      });

      await createdUser.save({session});

      // await actions.users.verifyUser({
      //   user: createdUser,
      //   locale: getLocaleFromCookie({req}),
      // });

      await session.commitTransaction();

      next(UsersResponsesFactory.userRegisteredSuccessfully());
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  static async inviteUser(req, res, next) {
    const {email, role} = req.body;
    const token = req.jwtToken;

    const organizationId = token.user.currentActiveOrganization.organizationId;

    let session = null;
    let invitedUser = null;

    try {
      // Check if the user with the given email already exists
      const {user: existingUser} = await UsersServices.getUserByEmail({
        email,
        optionsInclude: ['organizations'],
      });

      const isUserPartOfCurrentOrganization = existingUser?.organizations.some(
        (org) => org.organizationId.toString() === organizationId
      );

      // If the user exists and is already part of the organization, return an error
      if (isUserPartOfCurrentOrganization)
        throw UsersErrorsFactory.userAlreadyRegisteredErr();

      session = await mongoose.startSession();
      session.startTransaction();

      if (existingUser) {
        // Reuse the existing user if found
        invitedUser = existingUser;
      } else {
        // Create a new user if not found
        const {doc, error} = await GeneralServices.create({
          data: {email},
          model: UsersModel,
          session,
          options: {
            fieldsInclusion: {include: ['organizations']},
          },
        });

        if (error) throw error;

        doc.generateInvitationToken();
        invitedUser = doc;
      }

      const {doc: permissions, error: createPermissionError} =
        await GeneralServices.create({
          model: PermissionsModel,
          data: {
            userId: invitedUser._id,
            organizationId,
            levels: {
              users: {
                view: [invitedUser._id],
                update: [invitedUser._id],
              },
            },
          },
          session, // Pass session to ensure atomicity
        });

      if (createPermissionError) throw createPermissionError;

      invitedUser.organizations.push({
        organizationId,
        permissions: permissions._id,
        role,
        isActive: !existingUser,
      });

      await invitedUser.save({session}); // Save user within the session

      await actions.users.inviteUser({
        user: invitedUser,
        locale: getLocaleFromCookie({req}),
      });

      await session.commitTransaction(); // Commit the transaction

      return next(UsersResponsesFactory.userInvitedSuccessfully());
    } catch (error) {
      if (session) await session.abortTransaction(); // Rollback the transaction on error

      throw error;
    } finally {
      if (session) session.endSession(); // Ensure the session is always ended
    }
  }
  static async verifyInvitedUser(req, res, next) {
    const {password, firstName, lastName} = req.body;
    const token = req.params.token;

    const decodedToken = jwtUtils.verifyToken({token});
    if (!decodedToken) throw UsersErrorsFactory.loginResetTokenErr();

    const {doc: user} = await GeneralServices.findOne({
      query: {invitationToken: token},
      model: UsersModel,
    });

    if (!user) throw UsersErrorsFactory.loginResetTokenErr();

    user.password = password;
    user.firstName = firstName;
    user.lastName = lastName;
    user.isVerified = true;
    user.invitationToken = undefined;

    await user.save();

    return next(UsersResponsesFactory.userVerifiedSuccessfully());
  }

  static async getLoggedInUserInformation(req, res, next) {
    const {success, user, error} = await UsersServices.getUserById({
      _id: req.jwtToken.user._id,
    });

    if (!success) throw error;

    if (!user) throw UsersErrorsFactory.userNotFoundErr();

    return next(
      UsersResponsesFactory.singleUserInfoRetrievedRes({
        user,
      })
    );
  }

  static async loginUser(req, res, next) {
    const inputData = req.body;

    const {
      success: isSuccessful,
      user: userToLogin,
      error,
    } = await UsersServices.getUserByEmail({
      email: inputData.email,
      isPasswordRequired: true,
    });

    if (!isSuccessful) throw error;

    if (!userToLogin || !userToLogin.password)
      throw UsersErrorsFactory.wrongEmailOrPasswordErr();

    const {
      success,
      isPasswordVerified,
      error: verificationError,
    } = await UsersServices.verifyUserPassword({
      inputPassword: inputData.password,
      dbPassword: userToLogin.password,
    });

    if (!success) throw verificationError;

    if (!isPasswordVerified) throw UsersErrorsFactory.wrongEmailOrPasswordErr();

    if (!userToLogin.isVerified) throw UsersErrorsFactory.userNotVerifiedErr();

    userToLogin.password = undefined;

    return next(
      UsersResponsesFactory.userLoggedInSuccessfully({
        user: userToLogin,
        isLoginRequest: true,
      })
    );
  }

  static async forgetPassword(req, res, next) {
    const {success, user, error} = await UsersServices.getUserByEmail({
      email: req.body.email,
    });

    if (!success) throw error;

    if (!user) throw UsersErrorsFactory.userNotFoundErr();

    const resetToken = user.generateResetToken();
    await user.save();

    await actions.users.resetPassword({
      user,
      resetToken,
      locale: getLocaleFromCookie({req}),
    });

    next(UsersResponsesFactory.resetPasswordLinkGeneratedSuccessfully());
  }

  static async resetPassword(req, res, next) {
    const newPassword = req.body.password;
    const token = req.params.token;

    const decodedToken = jwtUtils.verifyToken({token});
    if (!decodedToken) throw UsersErrorsFactory.loginResetTokenErr();

    const resetArgs = {email: decodedToken.email, newPassword, token};

    const {isDocumentUpdated, error} = await UsersServices.resetPassword({
      resetArgs,
    });

    if (error) throw error;

    if (!isDocumentUpdated) throw UsersErrorsFactory.loginResetTokenUserErr();

    next(UsersResponsesFactory.passwordResetSuccessfully());
  }

  static async logout(req, res, next) {
    const BASE_URL = config.get('frontendURL');
    const cookieDomain = getCookieDomain({url: BASE_URL});
    const cookieName = getTokenHeaderName();

    res.clearCookie(cookieName, {
      domain: cookieDomain,
      path: '/',
    });

    next(UsersResponsesFactory.logoutSuccessfully());
  }

  static async verifyUser(req, res, next) {
    const {token} = req.params;

    const decodedToken = jwtUtils.verifyToken({token});
    if (!decodedToken) throw UsersErrorsFactory.loginResetTokenErr();

    const {
      success: isUserFound,
      user,
      error,
    } = await UsersServices.getUserById({
      _id: decodedToken._id,
    });

    if (!isUserFound) throw error;

    if (user.isVerified) throw UsersErrorsFactory.userAlreadyVerifiedErr();

    const {error: verificationError, isDocumentUpdated} =
      await UsersServices.verifyUser({
        decodedToken,
      });
    if (verificationError) throw verificationError;

    if (isDocumentUpdated)
      return next(UsersResponsesFactory.userVerifiedSuccessfully());
  }

  static async regenerateVerifyToken(req, res, next) {
    const {email} = req.body;

    const {success, user, error} = await UsersServices.getUserByEmail({
      email,
      optionsInclude: ['verificationToken'],
    });

    if (!success) throw error;

    if (!user?.verificationToken) throw GeneralErrorsFactory.badRequestErr();

    user.generateVerificationToken();
    await user.save();

    await actions.users.verifyUser({user});

    next(UsersResponsesFactory.resendVerificationEmail());
  }

  static async deleteUser(req, res, next) {
    const userId = req.params._id;

    const {doc, error} = await GeneralServices.findByIdAndDelete({
      model: UsersModel,
      _id: userId,
      options: createOptions({extraQueries: req.extraQueries}),
    });
    if (error) throw error;
    if (doc)
      next(
        GeneralResponsesFactory.dataDeletedSuccessfully({
          data: doc,
          key: 'user',
        })
      );
    else throw UsersErrorsFactory.userNotFoundErr();
  }

  static async updateUserLanguage(req, res, next) {
    const userId = req.jwtToken.user._id;
    const {language} = req.body;

    const updateArgs = {userId, language};

    const {success, error} = await UsersServices.updateUserLanguage({
      updateArgs,
    });

    if (!success) throw error;

    next(UsersResponsesFactory.languageUpdatedSuccessfully());
  }
};
