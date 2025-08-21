const {MongosFactory} = require('../factories');
const {PermissionsModel} = require('../models');

module.exports = class PermissionsServices {
  static async updatePermissions({
    _id,
    entityToUpdate,
    updatedValues,
    options,
    session,
  }) {
    const updateData = Object.entries(updatedValues).reduce(
      (acc, [level, value]) => {
        acc[`levels.${entityToUpdate}.${level}`] = value;

        return acc;
      },
      {}
    );

    const {success, docs, error} = await MongosFactory.findByIdAndUpdate({
      model: PermissionsModel,
      options,
      session,
      _id,
      data: {
        $addToSet: updateData,
      },
    });

    return {success, docs, error};
  }
};
