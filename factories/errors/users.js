const AppError = require('./AppError');

const {USER_ERRORS_TYPES} = require('../../constants/responses/errors/users');

module.exports = class UsersErrorsFactory {
  static userAlreadyRegisteredErr() {
    return new AppError({
      message: 'user already registered',
      statusCode: 409,
      error: {type: USER_ERRORS_TYPES.userAlreadyRegistered.value},
    });
  }

  static userNotFoundErr() {
    return new AppError({
      message: 'user not found',
      statusCode: 404,
      error: {type: USER_ERRORS_TYPES.userNotFound.value},
    });
  }

  static wrongEmailOrPasswordErr() {
    return new AppError({
      message: 'wrong credentials',
      statusCode: 401,
      error: {type: USER_ERRORS_TYPES.wrongEmailOrPassword.value},
    });
  }

  static loginResetTokenErr() {
    return new AppError({
      message:
        'Token is either expired or is invalid. Please create a new token and try again',
      statusCode: 401,
      error: {type: USER_ERRORS_TYPES.invalidResetToken.value},
    });
  }

  static loginResetTokenUserErr() {
    return new AppError({
      message:
        'Password reset failed. Either the reset link is already used or the user is deleted',
      statusCode: 400,
      error: {type: USER_ERRORS_TYPES.passwordResetFailed.value},
    });
  }

  static userNotVerifiedErr() {
    return new AppError({
      message: 'User Not Verified',
      statusCode: 400,
      error: {
        type: USER_ERRORS_TYPES.userNotVerified.value,
      },
    });
  }

  static userAlreadyVerifiedErr() {
    return new AppError({
      message: 'user already verified',
      statusCode: 400,
      error: {type: USER_ERRORS_TYPES.userAlreadyVerified.value},
    });
  }

  // 🔴 ===== NEW ERRORS FOR CARTRADEZ FLOW =====

  static dealerPendingApprovalErr() {
    return new AppError({
      message: 'Dealer account is pending admin approval is required' ,
      statusCode: 403,
      error: {
        type: USER_ERRORS_TYPES.dealerPendingApproval
          ? USER_ERRORS_TYPES.dealerPendingApproval.value
          : 'dealerPendingApproval',
      },
    });
  }
static dealerRejectedErr() {
    return new AppError({
      message: 'Dealer account has been rejected by admin',     
      statusCode: 403,
      error: {
        type: USER_ERRORS_TYPES.dealerRejected
          ? USER_ERRORS_TYPES.dealerRejected.value
          : 'dealerRejected',
      },
    });
  } 
  static dealerApprovedErr() {
    return new AppError({
      message: 'Dealer account has been approved by admin',         
      statusCode: 200,
      error: {
        type: USER_ERRORS_TYPES.dealerApproved        
          ? USER_ERRORS_TYPES.dealerApproved.value
          : 'dealerApproved',
      },
    });
  }   
  static userBlockedErr() {
    return new AppError({
      message: 'Your account has been blocked by admin',
      statusCode: 403,
      error: {
        type: USER_ERRORS_TYPES.userBlocked
          ? USER_ERRORS_TYPES.userBlocked.value
          : 'userBlocked',
      },
    });
  }
};
