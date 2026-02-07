const AppResponse = require('./AppResponse');

const {USER_SUCCESS_TYPES} = require('../../constants/responses/success/users');

module.exports = class UsersResponsesFactory {
  constructor() {}

  static userRegisteredSuccessfully() {
    return new AppResponse({
      message: 'User registered successfully',
      statusCode: 201,
      body: {type: USER_SUCCESS_TYPES.userRegisteredSuccessfully.value},
    });
  }

  static userInvitedSuccessfully() {
    return new AppResponse({
      message: 'User invited successfully',
      statusCode: 201,
      body: {type: USER_SUCCESS_TYPES.userInvitedSuccessfully.value},
    });
  }
  static dealerRegisteredSuccessfully() {
    return new AppResponse({
      message: 'Dealer registered successfully',      
      statusCode: 201,
      body: {type: USER_SUCCESS_TYPES.dealerRegisteredSuccessfully.value},
    });
  }   
    static dealerApprovedSuccessfully() {
    return new AppResponse({
      message: 'Dealer approved successfully',
      statusCode: 200, 
      body: { type: USER_SUCCESS_TYPES.dealerApprovedSuccessfully.value },
    });
  }
  static userLoggedInSuccessfully({user, isLoginRequest}) {
    return new AppResponse({
      message: 'User logged in successfully',
      statusCode: 200,
      body: {
        user,
        isLoginRequest,
        type: USER_SUCCESS_TYPES.userLoggedInSuccessfully.value,
      },
    });
  }

  static singleUserInfoRetrievedRes({user} = {}) {
    return new AppResponse({
      message: 'User info retrieved successfully',
      statusCode: 200,
      body: {user, type: USER_SUCCESS_TYPES.UserInfoRetrievedRes.value},
    });
  }

  static resetPasswordLinkGeneratedSuccessfully() {
    return new AppResponse({
      message: 'Reset password link sent successfully',
      statusCode: 200,
      body: {
        type: USER_SUCCESS_TYPES.resetPasswordLinkGeneratedSuccessfully.value,
      },
    });
  }

  static passwordResetSuccessfully() {
    return new AppResponse({
      statusCode: 200,
      message: 'Password reset successfully',
      body: {type: USER_SUCCESS_TYPES.passwordResetSuccessfully.value},
    });
  }

  static logoutSuccessfully() {
    return new AppResponse({
      statusCode: 200,
      message: 'Logout successfully',
      body: {type: USER_SUCCESS_TYPES.logoutSuccessfully.value},
    });
  }


  static userVerifiedSuccessfully() {
    return new AppResponse({
      statusCode: 200,
      message: 'User verified successfully',
      body: {type: USER_SUCCESS_TYPES.userVerifiedSuccessfully.value},
    });
  }

  static resendVerificationEmail() {
    return new AppResponse({
      statusCode: 200,
      message: 'Email Verification sent successfully',
      body: {type: USER_SUCCESS_TYPES.verificationEmailSentSuccessfully.value},
    });
  }

  static languageUpdatedSuccessfully() {
    return new AppResponse({
      message: 'Language updated successfully',
      statusCode: 200,
      body: {type: USER_SUCCESS_TYPES.languageUpdatedSuccessfully.value},
    });
  }
};
