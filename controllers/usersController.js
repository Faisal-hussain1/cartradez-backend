const config = require('config');
const mongoose = require('mongoose');
const axios = require('axios');
const {getOAuth2Client} = require("../utils/googleAuth")

const {usersConstants, accessConstants} = require('../constants');

const {
  UsersErrorsFactory,
  GeneralErrorsFactory,
  UsersResponsesFactory,
} = require('../factories');

const {UsersModel} = require('../models');
const {UsersServices, FileServices} = require('../services');

const {jwtUtils, createOptions, getLocaleFromCookie} = require('../utils');

const actions = require('../utils/actions');
const {getCookieDomain} = require('../utils/urlUtils');
const {getTokenHeaderName} = require('../utils/getTokenHeaderUtils');
const {LOCALES} = require('../constants/generalConstant');
const { first } = require('lodash');

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

      if (createdUser._id) {
        await actions.users.verifyUser({
          user: createdUser,
          locale: getLocaleFromCookie({req}),
        });
      }

      createdUser.termsAccepted = req.body.acceptTerms;
      createdUser.privacyAccepted = req.body.acceptPrivacy;
      await createdUser.save({session});

      await session.commitTransaction();

      return res.status(200).json({
        success: true,
        message: 'User registered successfully',
      });
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const {code} = req.query;

      if (!code) {
        throw GeneralErrorsFactory.badRequestErr();
      }

      // Get the OAuth2 client (lazy initialized)
      const oauth2client = getOAuth2Client();

      // Exchange authorization code for tokens
      const googleRes = await oauth2client.getToken(code);
      oauth2client.setCredentials(googleRes.tokens);

      // Get user info from Google
      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
      );
      const {given_name, family_name, email, picture} = userRes.data;

      // Check if user exists
      let {user, error} = await UsersServices.getUserByEmail({email});
      if (error) throw error;

      let isNewUser = false;

      // If user exists, log them in
      if (user) {
        // Generate JWT tokens for existing user
        const accessToken = jwtUtils.generateToken({
          payload: {
            _id: user._id,
            email: user.email,
            systemRole: user.systemRole,
          },
          expiry: process.env.JWT_ACCESS_EXPIRY || '30d',
        });

        const refreshToken = jwtUtils.generateToken({
          payload: {
            _id: user._id,
            email: user.email,
            systemRole: user.systemRole,
          },
          expiry: process.env.JWT_REFRESH_EXPIRY || '30d',
        });

        console.log(refreshToken)

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          isNewUser: false,
          needsAdditionalInfo: false,
          user,
          accessToken,
        });
      }

      // For new users, return data without saving to DB yet
      // User will be saved only after completing signup form with phone, city, country, address
      isNewUser = true;
      const tempAccessToken = jwtUtils.generateToken({
        payload: {email},
        expiry: '15m', // Short lived token for completing signup
      });



      res.status(200).json({
        success: true,
        message: 'Please complete your profile to finish signup',
        isNewUser: true,
        needsAdditionalInfo: true,
        tempAccessToken, // Token for completing signup
        googleUserData: {
          firstName: given_name,
          lastName: family_name,
          email,
          profileImage: picture,
        },
        user: null, // User not saved to DB yet
      });
    } catch (error) {
      next(error);
    }
  }

  static async completeGoogleSignup(req, res, next) {
    try {
      const {
        tempAccessToken,
        phoneNumber,
        city,
        address,
        country,
        firstName,
        lastName,
        profileImage,
        acceptTerms,
        acceptPrivacy,
      } = req.body;

      if (
        !tempAccessToken ||
        !phoneNumber ||
        !city ||
        !address ||
        !country ||
        !firstName ||
        !lastName ||
        acceptTerms !== true ||
        acceptPrivacy !== true
      ) {
        throw GeneralErrorsFactory.badRequestErr();
      }

      const decodedToken = jwtUtils.verifyToken({token: tempAccessToken});
      if (!decodedToken || !decodedToken.email) {
        throw GeneralErrorsFactory.badRequestErr();
      }

      const email = decodedToken.email;
      const {user: existingUser, error} = await UsersServices.getUserByEmail({email});
      if (error) throw error;

      let user = existingUser;

      if (!user) {
        const {user: createdUser, error: userCreationError} =
          await UsersServices.createUser({
            data: {
              firstName,
              lastName,
              email,
              phoneNumber,
              city,
              address,
              country,
              profileImage: profileImage || null,
              systemRole: usersConstants.SYSTEM_ROLES.user.value,
              isGoogleOAuthUser: true,
              isVerified: true,
              termsAccepted: true,
              privacyAccepted: true,
            },
          });

        if (userCreationError) throw userCreationError;
        user = createdUser;
      } else {
        user.termsAccepted = true;
        user.privacyAccepted = true;
        await user.save();
      }

      const accessToken = jwtUtils.generateToken({
        payload: {
          _id: user._id,
          email: user.email,
          systemRole: user.systemRole,
        },
        expiry: process.env.JWT_ACCESS_EXPIRY,
      });

      return res.status(200).json({
        success: true,
        message: 'Google signup completed successfully',
        user: {
          _id: user._id,
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
          systemRole: user.systemRole,
          country: user.country,
          city: user.city,
          address: user.address,
          isVerified: user.isVerified,
        },
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }


  static async verifyUser(req, res, next) {
    try {
      const token = req.params.token;
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

  static async getUserById(req, res) {
    try {
      const {id} = req.params;

      // ✅ validate id
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      // ✅ find user (exclude sensitive fields)
      const user = await UsersModel.findById(id).select('-password -__v');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
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
    const accessExpiry = process.env.JWT_ACCESS_EXPIRY;

    const token = jwtUtils.generateToken({
      payload: {
        _id: userToLogin._id,
        email: userToLogin.email,
        systemRole: userToLogin.systemRole,
      },
      accessExpiry,
    });

    return res.status(200).json({
      data: {
        user: userToLogin,
        token,
      },

      message: 'Logged in successfully',
      success: true,
    });
  }

  // =========================
  // UPDATE PROFILE (ALL USERS)
  // =========================
  static async updateProfile(req, res, next) {
    const user = req.jwtToken;

    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'country',
      'state',
      'city',
      'address',
      'profileImage',
      'termsAccepted',
      'privacyAccepted',
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
    try {
      /* PROFILE IMAGE UPLOAD */

      if (req.file) {
        const image = await FileServices.uploadSingleFile({
          file: req.file,
          fileDir: `profile-image_${user._id}`,
        });
        // since schema expects string
        updateData.profileImage = image.url;
      }

      const updatedUser = await UsersModel.findByIdAndUpdate(
        user._id,
        updateData,
        {new: true}
      );

      if (updatedUser) {
        return res.json({
          statusCode: 201,
          message: 'Profile updated!',
          data: {user: updatedUser},
        });
      }
    } catch (error) {
      return next(error);
    }
  }
  static async addDealerInfo(req, res, next) {
    const user = req.jwtToken;
    const _id = req.params._id;
    if (_id !== user._id)
      return res.json({
        statusCode: 400,
        message: 'Invalid User',
        success: false,
      });
    const allowedFields = [
      'carTypes',
      'experience',
      'nrcNo',
      'ntnNo',
      'showroomAddress',
      'showroomName',
      'socialMedia',
      ];

    const existingUser = await UsersModel.findById(_id).select(
      'requestLimit dealerStatus'
    );

    if (!existingUser) {
      return res.status(404).json({
        statusCode: 404,
        message: 'User not found',
        success: false,
      });
    }

    const usedAttempts = Number(existingUser.requestLimit || 0);
    const maxAttempts = 3;

    if (usedAttempts >= maxAttempts) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message:
          'Dealer request limit reached (3/3). You cannot submit the dealer form again.',
      });
    }

    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );
    updateData.systemRole = 'dealer';
    updateData.requestLimit = usedAttempts + 1;
    updateData.dealerStatus = usersConstants.DEALER_STATUS.pending.value;
    updateData.approved = false;
    updateData.rejected = false;
    updateData.rejectReason = null;
    const updatedUser = await UsersModel.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    if (updatedUser) {
      updatedUser.dealerStatusHistory = updatedUser.dealerStatusHistory || [];
      updatedUser.dealerStatusHistory.push({
        status: usersConstants.DEALER_STATUS.pending.value,
        reason: 'Dealer request submitted',
        updatedBy: user._id,
        updatedAt: new Date(),
      });
      await updatedUser.save();
    }
    if (updatedUser)
      return res.json({
        statusCode: 201,
        message: `Dealer Request Submitted. Please wait for admin approval. Attempts used: ${updateData.requestLimit}/3`,
        success: true,
        updatedUser,
      });
  }

  static async getDealers(req, res, next) {
    const loggedInRole = req?.jwtToken?.systemRole;
    if (loggedInRole !== usersConstants.SYSTEM_ROLES.admin.value) {
      return res.status(403).json({success: false, message: 'Unauthorized'});
    }

    const dealers = await UsersModel.find({
      $or: [
        {showroomName: {$exists: true, $ne: null, $nin: ['']}},
        {showroomAddress: {$exists: true, $ne: null, $nin: ['']}},
        {'dealerStatusHistory.0': {$exists: true}},
      ],
    })
      .select('-password')
      .sort({updatedAt: -1});

    return res.status(200).json({
      success: true,
      message: 'Dealers fetched successfully',
      data: dealers,
    });
  }

  static async getDealerById(req, res, next) {
    const loggedInRole = req?.jwtToken?.systemRole;
    if (loggedInRole !== usersConstants.SYSTEM_ROLES.admin.value) {
      return res.status(403).json({success: false, message: 'Unauthorized'});
    }

    const dealer = await UsersModel.findById(req.params.id).select('-password');
    if (!dealer) {
      return res
        .status(404)
        .json({success: false, message: 'Dealer not found'});
    }

    return res.status(200).json({
      success: true,
      message: 'Dealer fetched successfully',
      data: dealer,
    });
  }

  static async updateDealerStatus(req, res, next) {
    const loggedInRole = req?.jwtToken?.systemRole;
    if (loggedInRole !== usersConstants.SYSTEM_ROLES.admin.value) {
      return res.status(403).json({success: false, message: 'Unauthorized'});
    }

    const {status, rejectReason} = req.body || {};
    if (
      ![
        usersConstants.DEALER_STATUS.approved.value,
        usersConstants.DEALER_STATUS.rejected.value,
      ].includes(status)
    ) {
      return res.status(400).json({success: false, message: 'Invalid status'});
    }

    if (
      status === usersConstants.DEALER_STATUS.rejected.value &&
      (!rejectReason || !String(rejectReason).trim())
    ) {
      return res
        .status(400)
        .json({success: false, message: 'Reject reason is required'});
    }

    const dealer = await UsersModel.findById(req.params.id).select(
      'email firstName lastName dealerStatus'
    );
    if (!dealer) {
      return res
        .status(404)
        .json({success: false, message: 'Dealer not found'});
    }
    const historyEntry = {
      status,
      reason:
        status === usersConstants.DEALER_STATUS.rejected.value
          ? String(rejectReason).trim()
          : 'Dealer request approved by admin',
      updatedBy: req?.jwtToken?._id || null,
      updatedAt: new Date(),
    };

    const setData = {
      dealerStatus: status,
    };

    if (status === usersConstants.DEALER_STATUS.approved.value) {
      setData.systemRole = usersConstants.SYSTEM_ROLES.dealer.value;
      setData.approved = true;
      setData.rejected = false;
      setData.rejectReason = null;
    }

    if (status === usersConstants.DEALER_STATUS.rejected.value) {
      setData.systemRole = usersConstants.SYSTEM_ROLES.user.value;
      setData.approved = false;
      setData.rejected = true;
      setData.rejectReason = String(rejectReason).trim();
      setData.showroomName = null;
      setData.nrcNo = null;
      setData.experience = 0;
      setData.carTypes = null;
      setData.showroomAddress = null;
      setData.ntnNo = null;
      setData.socialMedia = null;
      setData.creditsLeft = 0;
    }

    const updatedDealer = await UsersModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: setData,
        $push: {dealerStatusHistory: historyEntry},
      },
      {new: true}
    );

    try {
      await actions.users.dealerDecision({
        user: updatedDealer,
        status,
        reason: status === usersConstants.DEALER_STATUS.rejected.value
          ? String(rejectReason).trim()
          : null,
      });
    } catch (emailError) {
      console.log('Dealer status email error:', emailError?.message);
    }

    return res.status(200).json({
      success: true,
      message:
        status === usersConstants.DEALER_STATUS.approved.value
          ? 'Dealer approved successfully'
          : 'Dealer rejected successfully',
      data: updatedDealer,
    });
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
    const loggedInUserId = req?.jwtToken?.user?._id || req?.jwtToken?._id;
    if (!loggedInUserId) throw UsersErrorsFactory.userNotFoundErr();

    const {user} = await UsersServices.getUserById({
      _id: loggedInUserId,
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

  static async acceptTerms(req, res) {
    const isLoggedIn = req.jwtToken;
    const user = await UsersModel.findById(isLoggedIn?._id);

    if (!user) return res.status(400).json({msg: 'User Not found'});

    user.termsAccepted = true;

    await user.save();

    return res.status(400).json({msg: 'Terms and conditions accepted', user});
  }

  static async acceptPrivacy(req, res) {
    const isLoggedIn = req.jwtToken;
    const user = await UsersModel.findById(isLoggedIn?._id);

    if (!user) return res.status(400).json({msg: 'User Not found'});

    user.privacyAccepted = true;
    await user.save();
    return res
      .status(400)
      .json({msg: 'Privacy policy accepted accepted', user});
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
