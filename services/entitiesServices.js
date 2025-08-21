const {MongosFactory} = require('../factories');
const EntitiesModel = require('../models/EntitiesModel');

module.exports = class EntitiesServices {
  static async getAllEntities({query, session, options}) {
    const {success, docs, error} = await MongosFactory.find({
      model: EntitiesModel,
      query,
      options,
      session,
    });

    return {success, docs, error};
  }
};
