// const config = require('config');
// const mongoose = require('mongoose');

// const {usersConstants, accessConstants} = require('../constants');

// const {
//   UsersErrorsFactory,
//   GeneralErrorsFactory,
//   UsersResponsesFactory,
//   GeneralResponsesFactory,
// } = require('../factories');
// const {PermissionsModel, UsersModel} = require('../models');
// const {UsersServices, GeneralServices} = require('../services');
// const {jwtUtils, createOptions, getLocaleFromCookie} = require('../utils');
// const actions = require('../utils/actions');
// const {getCookieDomain} = require('../utils/urlUtils');
// const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
// const {LOCALES} = require('../constants/generalConstant');

// module.exports = class UsersController {
//   static async createUser(req, res, next) {
//     const data = req.body;

//     let session = null;

//     try {
//       const {user: existingUser, error} = await UsersServices.getUserByEmail({
//         email: data.email,
//       });

//       if (error) throw error;

//       if (existingUser) throw UsersErrorsFactory.userAlreadyRegisteredErr();

//       session = await mongoose.startSession();
//       session.startTransaction();

//       const {user: createdUser, error: userCreationError} =
//         await UsersServices.createUser({
//           data,
//           session,
//         });

//       if (userCreationError) throw userCreationError;

//       createdUser.generateVerificationToken();

//       const {error: organizationError, organization} =
//         await UsersServices.createUserOrganization({
//           organizationData: {
//             organizationName: `${data.firstName}'s Organization`,
//             creatorId: createdUser._id,
//           },
//           session,
//         });

//       if (organizationError) throw organizationError;

//       const organizationId = organization._id;

//       const {doc: permissions, error: createPermissionError} =
//         await GeneralServices.create({
//           model: PermissionsModel,
//           data: {
//             userId: createdUser._id,
//             organizationId,
//             levels: {
//               users: {
//                 view: [accessConstants.ACCESS_LEVELS.none],
//                 update: [accessConstants.ACCESS_LEVELS.none],
//               },
//               vehicles: {
//                 view: [accessConstants.ACCESS_LEVELS.all],
//                 update: [],
//                 remove: [accessConstants.ACCESS_LEVELS.none],
//               },
//             },
//           },
//           session,
//         });

//       if (createPermissionError) throw createPermissionError;

//       createdUser.organizations.push({
//         organizationId,
//         permissions: permissions._id,
//         role: usersConstants.SYSTEM_ROLES.user.value,
//         isActive: true,
//       });

//       await createdUser.save({session});

//       // await actions.users.verifyUser({
//       //   user: createdUser,
//       //   locale: getLocaleFromCookie({req}),
//       // });

//       await session.commitTransaction();

//       next(UsersResponsesFactory.userRegisteredSuccessfully());
//     } catch (error) {
//       if (session) await session.abortTransaction();
//       throw error;
//     } finally {
//       if (session) session.endSession();
//     }
//   }

//   static async inviteUser(req, res, next) {
//     const {email, role} = req.body;
//     const token = req.jwtToken;

//     const organizationId = token.user.currentActiveOrganization.organizationId;

//     let session = null;
//     let invitedUser = null;

//     try {
//       // Check if the user with the given email already exists
//       const {user: existingUser} = await UsersServices.getUserByEmail({
//         email,
//         optionsInclude: ['organizations'],
//       });

//       const isUserPartOfCurrentOrganization = existingUser?.organizations.some(
//         (org) => org.organizationId.toString() === organizationId
//       );

//       // If the user exists and is already part of the organization, return an error
//       if (isUserPartOfCurrentOrganization)
//         throw UsersErrorsFactory.userAlreadyRegisteredErr();

//       session = await mongoose.startSession();
//       session.startTransaction();

//       if (existingUser) {
//         // Reuse the existing user if found
//         invitedUser = existingUser;
//       } else {
//         // Create a new user if not found
//         const {doc, error} = await GeneralServices.create({
//           data: {email},
//           model: UsersModel,
//           session,
//           options: {
//             fieldsInclusion: {include: ['organizations']},
//           },
//         });

//         if (error) throw error;

//         doc.generateInvitationToken();
//         invitedUser = doc;
//       }

//       const {doc: permissions, error: createPermissionError} =
//         await GeneralServices.create({
//           model: PermissionsModel,
//           data: {
//             userId: invitedUser._id,
//             organizationId,
//             levels: {
//               users: {
//                 view: [invitedUser._id],
//                 update: [invitedUser._id],
//               },
//             },
//           },
//           session, // Pass session to ensure atomicity
//         });

//       if (createPermissionError) throw createPermissionError;

//       invitedUser.organizations.push({
//         organizationId,
//         permissions: permissions._id,
//         role,
//         isActive: !existingUser,
//       });

//       await invitedUser.save({session}); // Save user within the session

//       await actions.users.inviteUser({
//         user: invitedUser,
//         locale: getLocaleFromCookie({req}),
//       });

//       await session.commitTransaction(); // Commit the transaction

//       return next(UsersResponsesFactory.userInvitedSuccessfully());
//     } catch (error) {
//       if (session) await session.abortTransaction(); // Rollback the transaction on error

//       throw error;
//     } finally {
//       if (session) session.endSession(); // Ensure the session is always ended
//     }
//   }

//   static async verifyInvitedUser(req, res, next) {
//     const {password, firstName, lastName} = req.body;
//     const token = req.params.token;

//     const decodedToken = jwtUtils.verifyToken({token});
//     if (!decodedToken) throw UsersErrorsFactory.loginResetTokenErr();

//     const {doc: user} = await GeneralServices.findOne({
//       query: {invitationToken: token},
//       model: UsersModel,
//     });

//     if (!user) throw UsersErrorsFactory.loginResetTokenErr();

//     user.password = password;
//     user.firstName = firstName;
//     user.lastName = lastName;
//     user.isVerified = true;
//     user.invitationToken = undefined;

//     await user.save();

//     return next(UsersResponsesFactory.userVerifiedSuccessfully());
//   }

//   static async getLoggedInUserInformation(req, res, next) {
//     const {success, user, error} = await UsersServices.getUserById({
//       _id: req.jwtToken.user._id,
//     });

//     if (!success) throw error;

//     if (!user) throw UsersErrorsFactory.userNotFoundErr();

//     return next(
//       UsersResponsesFactory.singleUserInfoRetrievedRes({
//         user,
//       })
//     );
//   }

//   static async loginUser(req, res, next) {
//     const inputData = req.body;

//     const {
//       success: isSuccessful,
//       user: userToLogin,
//       error,
//     } = await UsersServices.getUserByEmail({
//       email: inputData.email,
//       isPasswordRequired: true,
//     });

//     if (!isSuccessful) throw error;

//     if (!userToLogin || !userToLogin.password)
//       return next(UsersErrorsFactory.wrongEmailOrPasswordErr());

//     const {
//       success,
//       isPasswordVerified,
//       error: verificationError,
//     } = await UsersServices.verifyUserPassword({
//       inputPassword: inputData.password,
//       dbPassword: userToLogin.password,
//     });

//     if (!success) throw verificationError;

//     if (!isPasswordVerified)
//       return next(UsersErrorsFactory.wrongEmailOrPasswordErr());

//     if (!userToLogin.isVerified)
//       return next(UsersErrorsFactory.userNotVerifiedErr());

//     userToLogin.password = undefined;

//     return next(
//       UsersResponsesFactory.userLoggedInSuccessfully({
//         user: userToLogin,
//         isLoginRequest: true,
//       })
//     );
//   }

//   static async forgetPassword(req, res, next) {
//     const {success, user, error} = await UsersServices.getUserByEmail({
//       email: req.body.email,
//     });

//     if (!success) throw error;

//     if (!user) throw UsersErrorsFactory.userNotFoundErr();

//     const resetToken = user.generateResetToken();
//     await user.save();

//     const domain = config.get('frontendURL');
//     const url = `${domain}/${LOCALES.en.value}/auth/reset/${resetToken}`;

//     await actions.users.resetPassword({user, resetUrl: url});

//     next(UsersResponsesFactory.resetPasswordLinkGeneratedSuccessfully());
//   }

//   static async resetPassword(req, res, next) {
//     const newPassword = req.body.password;
//     const token = req.params.token;

//     const decodedToken = jwtUtils.verifyToken({token});
//     if (!decodedToken) throw UsersErrorsFactory.loginResetTokenErr();

//     const resetArgs = {email: decodedToken.email, newPassword, token};

//     const {isDocumentUpdated, error} = await UsersServices.resetPassword({
//       resetArgs,
//     });

//     if (error) throw error;

//     if (!isDocumentUpdated) throw UsersErrorsFactory.loginResetTokenUserErr();

//     next(UsersResponsesFactory.passwordResetSuccessfully());
//   }

//   static async logout(req, res, next) {
//     const BASE_URL = config.get('frontendURL');
//     const cookieDomain = getCookieDomain({url: BASE_URL});
//     const cookieName = getTokenHeaderName();

//     res.clearCookie(cookieName, {
//       domain: cookieDomain,
//       path: '/',
//     });

//     next(UsersResponsesFactory.logoutSuccessfully());
//   }

//   static async verifyUser(req, res, next) {
//     const {token} = req.params;

//     const decodedToken = jwtUtils.verifyToken({token});
//     if (!decodedToken) throw UsersErrorsFactory.loginResetTokenErr();

//     const {
//       success: isUserFound,
//       user,
//       error,
//     } = await UsersServices.getUserById({
//       _id: decodedToken._id,
//     });

//     if (!isUserFound) throw error;

//     if (user.isVerified) throw UsersErrorsFactory.userAlreadyVerifiedErr();

//     const {error: verificationError, isDocumentUpdated} =
//       await UsersServices.verifyUser({
//         decodedToken,
//       });
//     if (verificationError) throw verificationError;

//     if (isDocumentUpdated)
//       return next(UsersResponsesFactory.userVerifiedSuccessfully());
//   }

//   static async regenerateVerifyToken(req, res, next) {
//     const {email} = req.body;

//     const {success, user, error} = await UsersServices.getUserByEmail({
//       email,
//       optionsInclude: ['verificationToken'],
//     });

//     if (!success) throw error;

//     if (!user?.verificationToken) throw GeneralErrorsFactory.badRequestErr();

//     user.generateVerificationToken();
//     await user.save();

//     await actions.users.verifyUser({user});

//     next(UsersResponsesFactory.resendVerificationEmail());
//   }

//   static async deleteUser(req, res, next) {
//     const userId = req.params._id;

//     const {doc, error} = await GeneralServices.findByIdAndDelete({
//       model: UsersModel,
//       _id: userId,
//       options: createOptions({extraQueries: req.extraQueries}),
//     });
//     if (error) throw error;
//     if (doc)
//       next(
//         GeneralResponsesFactory.dataDeletedSuccessfully({
//           data: doc,
//           key: 'user',
//         })
//       );
//     else throw UsersErrorsFactory.userNotFoundErr();
//   }

//   static async updateUserLanguage(req, res, next) {
//     const userId = req.jwtToken.user._id;
//     const {language} = req.body;

//     const updateArgs = {userId, language};

//     const {success, error} = await UsersServices.updateUserLanguage({
//       updateArgs,
//     });

//     if (!success) throw error;

//     next(UsersResponsesFactory.languageUpdatedSuccessfully());
//   }
// };



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
const {getCookieDomain} = require('../utils/urlUtils');
const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const {LOCALES} = require('../constants/generalConstant');

module.exports = class UsersController {
  // =========================
  // REGISTER (USER / DEALER)
  // =========================
  static async createUser(req, res, next) {
    const data = req.body;
    let session = null;

    try {
      // 🔐 public registration: only user or dealer
      if (
        data.systemRole &&
        ![
          usersConstants.SYSTEM_ROLES.user.value,
          usersConstants.SYSTEM_ROLES.dealer.value,
        ].includes(data.systemRole)
      ) {
        throw GeneralErrorsFactory.badRequestErr();
      }

      if (data.systemRole === usersConstants.SYSTEM_ROLES.dealer.value) {
        data.dealerStatus = usersConstants.DEALER_STATUS.pending.value;
      }

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

      // await actions.users.verifyUser({
      //   user: createdUser,
      //   locale: getLocaleFromCookie({req}) || 'en',
      // });
      // ✅ CHANGE: Send verification email
      if(createdUser._id){
      const isVerify=await actions.users.verifyUser({
        user: createdUser,
        locale: getLocaleFromCookie({req}),
      });
      if(isVerify) createdUser.isVerified=true;
    }


      // create default organization
      // const {organization, error: organizationError} =
      //   await UsersServices.createUserOrganization({
      //     organizationData: {
      //       organizationName: `${data.firstName}'s Organization`,
      //       creatorId: createdUser._id,
      //     },
      //     session,
      //   });

      // if (organizationError) throw organizationError;

      // const organizationId = organization._id;

      // default permissions
      // const {doc: permissions, error: permissionError} =
      //   await GeneralServices.create({
      //     model: PermissionsModel,
      //     data: {
      //       userId: createdUser._id,
      //       organizationId,
      //       levels: {
      //         users: {
      //           view: [accessConstants.ACCESS_LEVELS.none],
      //           update: [accessConstants.ACCESS_LEVELS.none],
      //         },
      //         vehicles: {
      //           view: [accessConstants.ACCESS_LEVELS.all],
      //           update: [],
      //           remove: [accessConstants.ACCESS_LEVELS.none],
      //         },
      //       },
      //     },
      //     session,
      //   });


      await createdUser.save({session});

      await session.commitTransaction();

      next(UsersResponsesFactory.userRegisteredSuccessfully());
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  static async verifyUser(req, res, next) {
    try {
      const token = req.body.token || req.params.token;

      const decodedToken = jwtUtils.verifyToken({token});

      if (!decodedToken) {
        return res.status(400).json({
          success: false,
          error: 'invalid_token',
        });
      }

      const {user} = await UsersServices.getUserById({
        _id: decodedToken._id,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'user_not_found',
        });
      }

      if (user.isVerified) {
        return res.status(200).json({
          success: true,
          already: true,
        });
      }

      user.isVerified = true;
      user.verificationToken = undefined;

      await user.save();

      return res.status(200).json({
        success: true,
        verified: true,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // =========================
  // LOGIN
  // =========================
  static async loginUser(req, res, next) {
    const inputData = req.body;

    const {
      success,
      user: userToLogin,
      error,
    } = await UsersServices.getUserByEmail({
      email: inputData.email,
      isPasswordRequired: true,
    });

    if (!success) throw error;
    if (!userToLogin || !userToLogin.password)
      throw UsersErrorsFactory.wrongEmailOrPasswordErr();

    if (userToLogin.isBlocked) throw UsersErrorsFactory.userBlockedErr();

    if (
      userToLogin.systemRole === 'dealer' &&
      userToLogin.dealerStatus !== usersConstants.DEALER_STATUS.approved.value
    ) {
      throw UsersErrorsFactory.dealerPendingApprovalErr();
    }

    const {isPasswordVerified} = await UsersServices.verifyUserPassword({
      inputPassword: inputData.password,
      dbPassword: userToLogin.password,
    });

    if (!isPasswordVerified) throw UsersErrorsFactory.wrongEmailOrPasswordErr();

    if (!userToLogin.isVerified) throw UsersErrorsFactory.userNotVerifiedErr();

    userToLogin.password = undefined;

    // next(
    //   UsersResponsesFactory.userLoggedInSuccessfully({
    //     user: userToLogin,
    //     isLoginRequest: true,
    //   })
    // );
    const accessExpiry=process.env.JWT_ACCESS_EXPIRY;

const token=jwtUtils.generateToken({
      payload: {
        _id: userToLogin._id,
        email: userToLogin.email,
        systemRole: userToLogin.systemRole,
      },
      accessExpiry
    });
    const cleanUser = Object.fromEntries(
  Object.entries(userToLogin).filter(([_, value]) => value != null)
);
    
return res.status(200).json({
  data: {
    user: cleanUser,
    token
  },
  
  message: 'Logged in successfully',
  success: true,
});
  }

  // =========================
  // UPDATE PROFILE (ALL USERS)
  // =========================
  static async updateProfile(req, res, next) {
    const user = req.jwtToken.user;

    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'country',
      'state',
      'city',
      'address',
    ];

    if (user.systemRole === usersConstants.SYSTEM_ROLES.dealer.value) {
      allowedFields.push('showroomName');
    }

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await UsersModel.findByIdAndUpdate(
      user._id,
      updateData,
      {new: true}
    );

    next(
      UsersResponsesFactory.singleUserInfoRetrievedRes({
        user: updatedUser,
      })
    );
  }
  static async addDealerInfo(req, res, next) {
    const user = req.jwtToken;
    const _id=req.params._id
    if(_id!==user._id) return res.json({statusCode:400,message:"Invalid User",success:false});
    const allowedFields = [
      'carTypes',
      'experience',
      'nrcNo',
      'ntnNo',
       'showroomAddress',
       'showroomName',
       'socialMedia',
    ];

   

    const updateData = Object.fromEntries(
  Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
);
    updateData.systemRole="dealer";
    const updatedUser = await UsersModel.findByIdAndUpdate(
      _id,
      updateData,
      {new: true}
    );
    if(updatedUser) return res.json({statusCode:201,message:"Dealer Request Submitted. Please wait for admin approval",success:true,updatedUser})

  }

  // =========================
  // APPROVE DEALER (ADMIN/MANAGER)
  // =========================
  static async approveDealer(req, res, next) {
    const dealer = await UsersModel.findById(req.params.id);
    if (!dealer) throw UsersErrorsFactory.userNotFoundErr();

    if (dealer.systemRole !== usersConstants.SYSTEM_ROLES.dealer.value) {
      throw GeneralErrorsFactory.badRequestErr();
    }

    dealer.dealerStatus = usersConstants.DEALER_STATUS.approved.value;

    await dealer.save();

    next(UsersResponsesFactory.userUpdatedSuccessfully());
  }

  // =========================
  // BLOCK USER (ADMIN)
  // =========================
  static async blockUser(req, res, next) {
    const user = await UsersModel.findById(req.params.id);
    if (!user) throw UsersErrorsFactory.userNotFoundErr();

    user.isBlocked = true;
    user.blockedAt = new Date();
    user.blockedBy = req.jwtToken.user._id;

    await user.save();

    next(UsersResponsesFactory.userUpdatedSuccessfully());
  }

  // =========================
  // GET LOGGED IN USER
  // =========================
  static async getLoggedInUserInformation(req, res, next) {
    const {user} = await UsersServices.getUserById({
      _id: req.jwtToken.user._id,
    });

    if (!user) throw UsersErrorsFactory.userNotFoundErr();

    next(
      UsersResponsesFactory.singleUserInfoRetrievedRes({
        user,
      })
    );
  }

  // =========================
  // FORGET PASSWORD
  // =========================
  static async forgetPassword(req, res, next) {
    console.log(' FORGET PASSWORD REQUEST FOR:', req.body.email);

    const {user} = await UsersServices.getUserByEmail({
      email: req.body.email,
    });

    if (!user) throw UsersErrorsFactory.userNotFoundErr();

    const resetToken = user.generateResetToken();
    await user.save();

    const domain = config.get('frontendURL');
    const url = `${domain}/${LOCALES.en.value}/auth/reset/${resetToken}`;

    await actions.users.resetPassword({
      user,
      resetUrl: url,
    });

    next(UsersResponsesFactory.resetPasswordLinkGeneratedSuccessfully());
  }

  // =========================
  // RESET PASSWORD
  // =========================
  static async resetPassword(req, res, next) {
    const token = req.params.token;
    const decodedToken = jwtUtils.verifyToken({token});

    if (!decodedToken) throw UsersErrorsFactory.loginResetTokenErr();

    const resetArgs = {
      email: decodedToken.email,
      newPassword: req.body.password,
      token,
    };

    const {isDocumentUpdated, error} = await UsersServices.resetPassword({
      resetArgs,
    });

    if (error) throw error;
    if (!isDocumentUpdated) throw UsersErrorsFactory.loginResetTokenUserErr();

    next(UsersResponsesFactory.passwordResetSuccessfully());
  }

  // =========================
  // LOGOUT
  // =========================
  static async logout(req, res, next) {
    const BASE_URL = process.env.FRONTEND_URL;
    const cookieDomain = getCookieDomain({url: BASE_URL});
    const cookieName = getTokenHeaderName();

    res.clearCookie(cookieName, {
      domain: cookieDomain,
      path: '/',
    });

    next(UsersResponsesFactory.logoutSuccessfully());
  }
};
  






// const config = require('config');
// const mongoose = require('mongoose');

// const {usersConstants, accessConstants} = require('../constants');

// const {
//   UsersErrorsFactory,
//   GeneralErrorsFactory,
//   UsersResponsesFactory,
//   GeneralResponsesFactory,
// } = require('../factories');
// const {PermissionsModel, UsersModel} = require('../models');
// const {UsersServices, GeneralServices} = require('../services');
// const {jwtUtils, createOptions, getLocaleFromCookie} = require('../utils');
// const actions = require('../utils/actions');
// const {getCookieDomain} = require('../utils/urlUtils');
// const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
// const {LOCALES} = require('../constants/generalConstant');

// module.exports = class UsersController {

//   // ------------------- CREATE USER -------------------
//   static async createUser(req, res, next) {
//     const data = req.body;
//     let session = null;

//     try {
//       const {user: existingUser, error} = await UsersServices.getUserByEmail({
//         email: data.email,
//       });
//       if (error) throw error;
//       if (existingUser) throw UsersErrorsFactory.userAlreadyRegisteredErr();

//       session = await mongoose.startSession();
//       session.startTransaction();

//       const {user: createdUser, error: userCreationError} = await UsersServices.createUser({
//         data,
//         session,
//       });
//       if (userCreationError) throw userCreationError;

//       // ✅ CHANGE: Generate verification token
//       createdUser.generateVerificationToken();

//      // ✅ CHANGE: Send verification email
//       await actions.users.verifyUser({
//       user: createdUser,
//         locale: getLocaleFromCookie({req}),
//       });

//       const {error: organizationError, organization} = await UsersServices.createUserOrganization({
//         organizationData: {
//           organizationName: `${data.firstName}'s Organization`,
//           creatorId: createdUser._id,
//         },
//         session,
//       });
//       if (organizationError) throw organizationError;

//       const organizationId = organization._id;

//       const {doc: permissions, error: createPermissionError} = await GeneralServices.create({
//         model: PermissionsModel,
//         data: {
//           userId: createdUser._id,
//           organizationId,
//           levels: {
//             users: {
//               view: [accessConstants.ACCESS_LEVELS.none],
//               update: [accessConstants.ACCESS_LEVELS.none],
//             },
//             vehicles: {
//               view: [accessConstants.ACCESS_LEVELS.all],
//               update: [],
//               remove: [accessConstants.ACCESS_LEVELS.none],
//             },
//           },
//         },
//         session,
//       });
//       if (createPermissionError) throw createPermissionError;

//       createdUser.organizations.push({
//         organizationId,
//         permissions: permissions._id,
//         role: usersConstants.SYSTEM_ROLES.user.value,
//         isActive: true,
//       });

//       await createdUser.save({session});
//       await session.commitTransaction();

//       next(UsersResponsesFactory.userRegisteredSuccessfully());
//     } catch (error) {
//       if (session) await session.abortTransaction();
//       throw error;
//     } finally {
//       if (session) session.endSession();
//     }
//   }

//   // ------------------- VERIFY USER -------------------
//   static async verifyUser(req, res, next) {
//     const {token} = req.params;
//     const decodedToken = jwtUtils.verifyToken({token});
//     if (!decodedToken) throw UsersErrorsFactory.loginResetTokenErr();

//     const {success: isUserFound, user, error} = await UsersServices.getUserById({_id: decodedToken._id});
//     if (!isUserFound) throw error;
//     if (user.isVerified) throw UsersErrorsFactory.userAlreadyVerifiedErr();

//     const {error: verificationError, isDocumentUpdated} = await UsersServices.verifyUser({decodedToken});
//     if (verificationError) throw verificationError;

//    // ✅ CHANGE: Clear verification token after verification
//     user.clearVerificationToken();
//    await user.save();

//     if (isDocumentUpdated)
//       return next(UsersResponsesFactory.userVerifiedSuccessfully());
//   }

//   // ------------------- LOGIN USER -------------------
//   static async loginUser(req, res, next) {
//     const inputData = req.body;
//     const {success: isSuccessful, user: userToLogin, error} = await UsersServices.getUserByEmail({
//       email: inputData.email,
//       isPasswordRequired: true,
//     });

//     if (!isSuccessful) throw error;
//     if (!userToLogin || !userToLogin.password) return next(UsersErrorsFactory.wrongEmailOrPasswordErr());

//     const {success, isPasswordVerified, error: verificationError} = await UsersServices.verifyUserPassword({
//       inputPassword: inputData.password,
//       dbPassword: userToLogin.password,
//     });
//     if (!success) throw verificationError;
//     if (!isPasswordVerified) return next(UsersErrorsFactory.wrongEmailOrPasswordErr());

//     if (!userToLogin.isVerified) return next(UsersErrorsFactory.userNotVerifiedErr());

//     userToLogin.password = undefined;

//     return next(
//       UsersResponsesFactory.userLoggedInSuccessfully({
//         user: userToLogin,
//         isLoginRequest: true,
//       })
//     );
//   }

//   // ------------------- FORGET PASSWORD -------------------
//   static async forgetPassword(req, res, next) {
//     const {success, user, error} = await UsersServices.getUserByEmail({email: req.body.email});
//     if (!success) throw error;
//     if (!user) throw UsersErrorsFactory.userNotFoundErr();

//     const resetToken = user.generateResetToken();
//     await user.save();

//     const domain = config.get('frontendURL');
//     const url = `${domain}/${LOCALES.en.value}/auth/reset/${resetToken}`;

//     await actions.users.resetPassword({user, resetUrl: url});

//     next(UsersResponsesFactory.resetPasswordLinkGeneratedSuccessfully());
//   }

//   // ------------------- RESET PASSWORD -------------------
//   static async resetPassword(req, res, next) {
//     const newPassword = req.body.password;
//     const token = req.params.token;

//     const decodedToken = jwtUtils.verifyToken({token});
//     if (!decodedToken) throw UsersErrorsFactory.loginResetTokenErr();

//     const resetArgs = {email: decodedToken.email, newPassword, token};
//     const {isDocumentUpdated, error} = await UsersServices.resetPassword({resetArgs});
//     if (error) throw error;
//     if (!isDocumentUpdated) throw UsersErrorsFactory.loginResetTokenUserErr();

//     next(UsersResponsesFactory.passwordResetSuccessfully());
//   }

//   // ------------------- LOGOUT -------------------
//   static async logout(req, res, next) {
//     const BASE_URL = config.get('frontendURL');
//     const cookieDomain = getCookieDomain({url: BASE_URL});
//     const cookieName = getTokenHeaderName();

//     res.clearCookie(cookieName, {
//       domain: cookieDomain,
//       path: '/',
//     });

//     next(UsersResponsesFactory.logoutSuccessfully());
//   }

//   // ------------------- OTHER METHODS (inviteUser, verifyInvitedUser, etc.) -------------------
//   // Keep them as-is; they already work for invitations and password reset
// };
