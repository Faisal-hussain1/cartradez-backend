const {MongosFactory} = require('../factories');
const OrganizationsModel = require('../models/OrganizationsModel');
const UsersModel = require('../models/UsersModel');
const {passwordsUtils} = require('../utils');
const {asyncTryCatch} = require('../utils/tryCatchUtils');

module.exports = class UsersServices {
  static async getUserByEmail({email, optionsInclude}) {
    const options = {
      fieldsInclusion: {include: optionsInclude},
    };
    const query = {email: email.toLowerCase()};

    const {
      success,
      doc: user,
      error,
    } = await MongosFactory.findOne({
      model: UsersModel,
      query,
      options,
    });

    return {success, user, error};
  }

  static async getUserById({_id}) {
    const query = {_id};

    const {
      success,
      doc: user,
      error,
    } = await MongosFactory.findOne({
      model: UsersModel,
      query,
    });

    return {success, user, error};
  }

  static async createUser({data, session, optionsInclude}) {
    const options = {
      fieldsInclusion: {include: optionsInclude},
    };

    const {doc, error, success} = await MongosFactory.create({
      model: UsersModel,
      data,
      session,
      options,
    });

    return {success, user: doc, error};
  }

  static async createUserOrganization({organizationData, session}) {
    const {doc, error, success} = await MongosFactory.create({
      model: OrganizationsModel,
      data: organizationData,
      session,
    });

    return {success, organization: doc, error};
  }

  static async verifyUserPassword({inputPassword, dbPassword}) {
    const {success, response, error} = await asyncTryCatch({
      fn: async () => await passwordsUtils.verify({inputPassword, dbPassword}),
    });

    return {success, isPasswordVerified: response, error};
  }

  static async resetPassword({resetArgs: {email, newPassword, token}}) {
    const {response: password} = await asyncTryCatch({
      fn: async () => passwordsUtils.saltHashPassword({password: newPassword}),
    });

    const query = {email, loginResetToken: token};
    const update = {password, $unset: {loginResetToken: 1}};

    const {success, error, isDocumentUpdated, responseObj} =
      await MongosFactory.updateOne({
        model: UsersModel,
        query,
        data: update,
      });

    return {success, error, isDocumentUpdated, responseObj};
  }

  static async setPermissions({
    permissionArgs: {userId, permissions},
    session,
  }) {
    const query = {_id: userId};
    const update = {};

    const addPermission = ({entityType, entityId, accessLevelsToSet}) => {
      update[`${entityType}.${entityId}`] = accessLevelsToSet;
    };

    if (Array.isArray(permissions)) permissions.forEach(addPermission);
    else addPermission(permissions);

    const {
      success,
      doc: user,
      error,
      isDocumentUpdated,
    } = await MongosFactory.findOneAndUpdate({
      model: UsersModel,
      query,
      data: update,
      session,
    });

    return {success, user, error, isDocumentUpdated};
  }

  static async removePermissions({mapKey}) {
    const query = {[mapKey]: {$exists: true}};
    const update = {$unset: {[mapKey]: 1}};

    const {success, error, areDocumentsUpdated, responseObj} =
      await MongosFactory.updateMany({
        model: UsersModel,
        query,
        data: update,
      });

    return {success, error, areDocumentsUpdated, responseObj};
  }

  static async verifyUser({decodedToken}) {
    const query = {_id: decodedToken._id};
    const update = {isVerified: true, $unset: {verificationToken: 1}};

    const {error, isDocumentUpdated, responseObj, success} =
      await MongosFactory.updateOne({
        model: UsersModel,
        query,
        data: update,
      });

    return {error, isDocumentUpdated, responseObj, success};
  }

  static async updateUserLanguage({updateArgs: {userId, language}}) {
    const query = {_id: userId};
    const update = {language};

    const {success, error} = await MongosFactory.updateOne({
      model: UsersModel,
      query,
      data: update,
    });

    return {success, error};
  }
};
