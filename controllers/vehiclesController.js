const {mongoose} = require('mongoose');
const {generalConstant} = require('../constants');
const {VehiclesResponsesFactory, VehiclesErrorsFactory} = require('../factories');
const {FileServices, GeneralServices} = require('../services');
const VehiclesModel = require('../models/VehiclesModel');
const {getCurrentTimestamp} = require('../utils/dateUtils');
const {VEHICLE_ACTIONS, VEHICLE_STATUSES} = require('../constants/vehicleConstants');
const {SYSTEM_ROLES} = require('../constants/usersConstants');

module.exports = class VehiclesController {
  static async addNewVehicle(req, res, next) {
    const data = req.body;
    const loggedInUser = req.jwtToken;
    if (!loggedInUser)
      return res.json({statusCode: 401, message: 'Something went wrong while authenticating user. Please login again.'});

    const isAdminRole = loggedInUser.role === SYSTEM_ROLES.admin.value;
    if (isAdminRole) data.isManagedByCartradez = true;

    let session, awsFileKeys = [], createdVehicleId, vehicleImages = [];

    if (req?.files && req.files.length < 3) return next(VehiclesErrorsFactory.vehicleLessImagesErr());
    if (req?.files && req.files.length > 9) return next(VehiclesErrorsFactory.vehicleMoreImagesErr());

    try {
      data.creatorId = loggedInUser?._id;
      data.events = [{action: VEHICLE_ACTIONS.created.value, userId: loggedInUser?._id, timestamp: getCurrentTimestamp()}];
      data.features = data.features || [];

      session = await mongoose.startSession();
      session.startTransaction();

      const {doc: createdVehicle, error: vehicleCreationError} = await GeneralServices.create({model: VehiclesModel, data, session});
      if (vehicleCreationError) throw vehicleCreationError;
      if (!createdVehicle) throw new Error('Vehicle creation failed');

      createdVehicleId = createdVehicle?._id?.toString();

      if (req?.files?.length > 0) {
        for (const file of req.files) {
          const image = await FileServices.uploadSingleFile({file, fileDir: `vehicle-image_${createdVehicleId}`});
          awsFileKeys.push(image.key);
          vehicleImages.push(image);
        }
      }

      createdVehicle.images = vehicleImages;
      createdVehicle.coverImage = {key: vehicleImages[0].key, url: vehicleImages[0].url};
      await createdVehicle.save({session});
      await session.commitTransaction();
      session.endSession();

      return res.json({statusCode: 201, message: 'Vehicle added successfully', success: true});
    } catch (error) {
      for (const key of awsFileKeys) await FileServices.deleteFile({key: `vehicle-image_${createdVehicleId}/${key}`});
      if (session) { await session.abortTransaction(); session.endSession(); }
      throw error;
    }
  }

  static async getAllVehicles(req, res, next) {
    const limit = parseInt(req.query.limit) || generalConstant.paginationDefaults.limit;
    const page = parseInt(req.query.page) || generalConstant.paginationDefaults.page;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const query = {};

    if (search) {
      const keywords = search.split(/\s+/);
      query.$and = keywords.map((word) => ({$or: [{make: {$regex: word, $options: 'i'}}, {model: {$regex: word, $options: 'i'}}, {variant: {$regex: word, $options: 'i'}}]}));
    }

    try {
      const {count, error: countError} = await GeneralServices.countDocuments({model: VehiclesModel, query});
      if (countError) throw countError;

      const {docs, error} = await GeneralServices.find({model: VehiclesModel, query, options: {queryProperties: {skip, limit, sort: {createdAt: -1}}, fieldsInclusion: {includeSpecificFields: ['_id make model year price currency coverImage listingType creatorId isManagedByCartradez']}}});
      if (error) throw error;

      return next(VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({vehicles: docs, count, page, limit, totalPages: Math.ceil(count / limit)}));
    } catch (err) {
      return next(err);
    }
  }

  static async getAllVehiclesOfLoggedInUser(req, res, next) {
    const limit = parseInt(req.query.limit) || generalConstant.paginationDefaults.limit;
    const page = parseInt(req.query.page) || generalConstant.paginationDefaults.page;
    const skip = (page - 1) * limit;
    const loggedInUser = req.jwtToken;

    if (!loggedInUser)
      return res.json({statusCode: 401, message: 'Something went wrong while authenticating user. Please login again.'});

    const loggedInUserId = loggedInUser._id?.toString();
    if (loggedInUserId !== req.params.id) return next(new Error('Unauthorized'));

    try {
      const query = {creatorId: loggedInUserId};
      const {count, error: countError} = await GeneralServices.countDocuments({model: VehiclesModel, query});
      if (countError) throw countError;

      const {docs, error} = await GeneralServices.find({
        model: VehiclesModel, query,
        options: {
          queryProperties: {skip, limit, sort: {createdAt: -1}},
          // All fields needed by the expanded edit modal
          fieldsInclusion: {
            includeSpecificFields: [
              '_id make model variant year price currency listingType coverImage creatorId createdAt mileage fuelType transmission bodyType color condition engineSize doors seats driveType description city country features status',
            ],
          },
        },
      });
      if (error) throw error;

      return next(VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({vehicles: docs, count, page, limit, totalPages: Math.ceil(count / limit)}));
    } catch (err) {
      return next(err);
    }
  }

  static async getVehicle(req, res, next) {
    const vehicleId = req.params.id;
    const {doc: retrievedVehicle, error: gettingVehicleErr} = await GeneralServices.findOne({
      model: VehiclesModel,
      query: {_id: vehicleId},
      options: {
        fieldsInclusion: {include: ['createdAt']},
        populateFields: [{path: 'creatorId', select: '_id firstName lastName phoneNumber organizations createdAt listingType address city country'}],
      },
    });

    if (gettingVehicleErr) throw gettingVehicleErr;
    if (!retrievedVehicle) return next(VehiclesErrorsFactory.vehicleNotFoundErr());

    const {count, error: countVehiclesErr} = await GeneralServices.countDocuments({
      model: VehiclesModel,
      query: {$and: [{creatorId: retrievedVehicle.creatorId._id}, {status: VEHICLE_STATUSES.active.value}]},
    });
    if (countVehiclesErr) throw countVehiclesErr;

    retrievedVehicle.creatorId = {...(retrievedVehicle.creatorId.toObject?.() || retrievedVehicle.creatorId), totalActiveVehicles: count};
    return next(VehiclesResponsesFactory.vehicleRetrievedSuccessfully({vehicle: retrievedVehicle}));
  }

  static async updateVehicle(req, res, next) {
    const vehicleId = req.params.id;
    const loggedInUser = req.jwtToken;

    if (!loggedInUser)
      return res.status(401).json({success: false, message: 'Something went wrong while authenticating user. Please login again.'});

    const body = req.body || {};
    if (Object.keys(body).length === 0)
      return res.status(400).json({success: false, message: 'Request body is empty. Please send vehicle update data.'});

    const {doc: existingVehicle, error: findErr} = await GeneralServices.findOne({model: VehiclesModel, query: {_id: vehicleId}});
    if (findErr) throw findErr;
    if (!existingVehicle) return next(VehiclesErrorsFactory.vehicleNotFoundErr());

    // const isAdmin = loggedInUser.role === SYSTEM_ROLES.admin.value;
    const isOwner = existingVehicle.creatorId?.toString() === loggedInUser._id?.toString();
    if (!isOwner)
      return res.status(403).json({success: false, message: 'You are not authorized to update this vehicle.'});

    const allowedFields = [
      'make', 'model', 'variant', 'year', 'price', 'currency', 'listingType',
      'mileage', 'fuelType', 'transmission', 'bodyType', 'color', 'condition',
      'engineSize', 'doors', 'seats', 'driveType', 'description',
      'city', 'country', 'features', 'status','numberOfOwners', 'registrationCity', 'registrationYear', 'registrationNumber',
    ];

    const setData = {};
    allowedFields.forEach((field) => { if (body[field] !== undefined) setData[field] = body[field]; });

    if (Object.keys(setData).length === 0)
      return res.status(400).json({success: false, message: 'No valid vehicle fields provided for update.'});

    const updateQuery = {
      $set: setData,
      $push: {events: {action: VEHICLE_ACTIONS.updated?.value || 'updated', userId: loggedInUser._id, timestamp: getCurrentTimestamp()}},
    };

    const {doc: updatedVehicle, error: updateErr} = await GeneralServices.findOneAndUpdate({
      model: VehiclesModel, query: {_id: vehicleId}, data: updateQuery, options: {new: true},
    });
    if (updateErr) throw updateErr;

    return res.status(200).json({statusCode: 200, success: true, message: 'Vehicle updated successfully', vehicle: updatedVehicle});
  }

  static async deleteVehicle(req, res, next) {
    const vehicleId = req.params.id;
    const loggedInUser = req.jwtToken;

    if (!loggedInUser)
      return res.status(401).json({success: false, message: 'Something went wrong while authenticating user. Please login again.'});

    const {doc: existingVehicle, error: findErr} = await GeneralServices.findOne({model: VehiclesModel, query: {_id: vehicleId}});
    if (findErr) throw findErr;
    if (!existingVehicle) return next(VehiclesErrorsFactory.vehicleNotFoundErr());

    // const isAdmin = loggedInUser.role === SYSTEM_ROLES.admin.value;
    const isOwner = existingVehicle.creatorId?.toString() === loggedInUser._id?.toString();
    if (!isOwner)
      return res.status(403).json({success: false, message: 'You are not authorized to delete this vehicle.'});

    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      if (existingVehicle.images?.length > 0) {
        for (const image of existingVehicle.images) {
          const fileKey = image.key?.startsWith(`vehicle-image_${vehicleId}/`)
            ? image.key
            : `vehicle-image_${vehicleId}/${image.key}`;
          await FileServices.deleteFile({key: fileKey});
        }
      }

      // FIX: previous code did `const del = await VehiclesModel.findByIdAndDelete(...)`
      // then referenced undeclared `deleteErr` → ReferenceError crash.
      // Use GeneralServices.deleteOne so the session is passed and errors follow
      // the standard {error} pattern used everywhere else in this codebase.
      const delVehicle=await VehiclesModel.findByIdAndDelete({_id: vehicleId}, {session});
      if (!delVehicle) throw new Error('Vehicle deletion failed');

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({statusCode: 200, message: 'Vehicle deleted successfully', success: true});
    } catch (error) {
      if (session) { await session.abortTransaction(); session.endSession(); }
      throw error;
    }
  }

  static async getAllManagedByCartradezVehicles(req, res, next) {
    const limit = parseInt(req.query.limit) || generalConstant.paginationDefaults.limit;
    const page = parseInt(req.query.page) || generalConstant.paginationDefaults.page;
    const skip = (page - 1) * limit;

    const {count, error: countErr} = await GeneralServices.countDocuments({model: VehiclesModel, query: {isManagedByCartradez: true}});
    if (countErr) throw countErr;

    const search = req.query.search?.trim();
    const query = {isManagedByCartradez: true};

    if (search) {
      const keywords = search.split(/\s+/);
      query.$and = keywords.map((word) => ({$or: [{make: {$regex: word, $options: 'i'}}, {model: {$regex: word, $options: 'i'}}, {variant: {$regex: word, $options: 'i'}}]}));
    }

    const {docs: retrievedVehicles, error: vehiclesRetrievedError} = await GeneralServices.find({
      model: VehiclesModel, query,
      options: {queryProperties: {skip, limit, sort: {createdAt: -1}}, fieldsInclusion: {includeSpecificFields: ['_id make model price currency coverImage']}},
    });
    if (vehiclesRetrievedError) throw vehiclesRetrievedError;

    return next(VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({vehicles: retrievedVehicles, count, page, limit, totalPages: Math.ceil(count / limit)}));
  }
};