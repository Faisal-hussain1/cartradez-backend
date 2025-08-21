const {MongosFactory} = require('../factories');

module.exports = class GeneralServices {
  static async create({model, data, options, session}) {
    return await MongosFactory.create({
      model,
      data,
      session,
      options,
    });
  }

  static async find({model, query, options}) {
    return await MongosFactory.find({
      model,
      query,
      options,
    });
  }

  static async findOne({model, query, options}) {
    // query can be for example {_id} , {status: "active"}
    return await MongosFactory.findOne({
      model,
      query,
      options,
    });
  }

  static async updateOne({model, query, data, options, session}) {
    return await MongosFactory.updateOne({
      model,
      query,
      data,
      options,
      session,
    });
  }
  static async updateMany({model, query, data, options, session}) {
    return await MongosFactory.updateMany({
      model,
      query,
      data,
      options,
      session,
    });
  }

  static async findAllByUserId({model, _id, options}) {
    // Method for finding all documents associated with a login user
    let query = {user: _id};

    return await MongosFactory.find({
      model,
      query,
      options,
    });
  }

  static async findOneAndUpdate({model, query, data, options, session}) {
    // query can be for example {_id} , {status: "active"}
    return await MongosFactory.findOneAndUpdate({
      model,
      query,
      data,
      options,
      session,
    });
  }

  static async findByIdAndUpdate({model, _id, data, options, session}) {
    return await MongosFactory.findByIdAndUpdate({
      model,
      _id,
      data,
      options,
      session,
    });
  }

  static async findAllAndUpdate({model, query, data, options, session}) {
    return await MongosFactory.findAllAndUpdate({
      model,
      query,
      data,
      options,
      session,
    });
  }

  static async findOneAndDelete({model, query, options, session}) {
    // query can be for example {_id} , {status: "active
    return await MongosFactory.findOneAndDelete({
      model,
      query,
      options,
      session,
    });
  }

  static async findByIdAndDelete({model, _id, options, session}) {
    return await MongosFactory.findByIdAndDelete({
      model,
      _id,
      options,
      session,
    });
  }

  static async findAllAndDelete({model, query, options, session}) {
    return await MongosFactory.findAllAndDelete({
      model,
      query,
      options,
      session,
    });
  }

  static async aggregate({model, pipeline, options}) {
    return await MongosFactory.aggregate({
      model,
      pipeline,
      options,
    });
  }
  static async countDocuments({model, query, options}) {
    return await MongosFactory.countDocuments({
      model,
      query,
      options,
    });
  }
};
