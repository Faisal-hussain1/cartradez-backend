 const config = require('config');
const mongoose = require('mongoose');

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

      if(createdUser._id){
      await actions.users.verifyUser({
        user: createdUser,
        locale: getLocaleFromCookie({req}),
      });
    }

      createdUser.termsAccepted=req.body.acceptTerms;
      createdUser.privacyAccepted=req.body.acceptPrivacy;
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

  static async  getUserById(req, res) {
  try {
    const { id } = req.params;

    // ✅ validate id
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // ✅ find user (exclude sensitive fields)
    const user = await UsersModel
      .findById(id)
      .select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data:user,
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
    const accessExpiry=process.env.JWT_ACCESS_EXPIRY;

const token=jwtUtils.generateToken({
      payload: {
        _id: userToLogin._id,
        email: userToLogin.email,
        systemRole: userToLogin.systemRole,
      },
      accessExpiry
    });
    
return res.status(200).json({
  data: {
    user: userToLogin,
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
  const user = req.jwtToken;

  const allowedFields = [
    "firstName",
    "lastName",
    "phoneNumber",
    "country",
    "state",
    "city",
    "address",
    "profileImage"
  ];

  if (user.systemRole === usersConstants.SYSTEM_ROLES.dealer.value) {
    allowedFields.push("showroomName");
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
      { new: true }
    );

    if (updatedUser) {
      return res.json({
        statusCode: 201,
        message: "User updated!",
        data: { user: updatedUser },
      });
    }

  } catch (error) {
    return next(error);
  }
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

  static async acceptTerms(req,res){
    const isLoggedIn=req.jwtToken;
    const user=await UsersModel.findById(isLoggedIn?._id);

    if(!user) return res.status(400).json({msg:"User Not found"});

    user.termsAccepted=true;

    await user.save();

    return res.status(400).json({msg:"Terms and conditions accepted",user});
  }

  static async acceptPrivacy(req,res){
    const isLoggedIn=req.jwtToken;
    const user=await UsersModel.findById(isLoggedIn?._id);

    if(!user) return res.status(400).json({msg:"User Not found"});

    user.privacyAccepted=true;
    await user.save();
    return res.status(400).json({msg:"Privacy policy accepted accepted",user});
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