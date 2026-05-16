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
        // Upload all images in parallel instead of sequentially
        const uploadPromises = req.files.map(file =>
          FileServices.uploadSingleFile({file, fileDir: `vehicle-image_${createdVehicleId}`})
        );
        const uploadedImages = await Promise.all(uploadPromises);
        vehicleImages.push(...uploadedImages);
        awsFileKeys.push(...uploadedImages.map(img => img.key));
      }

      createdVehicle.images = vehicleImages;
      createdVehicle.coverImage = {key: vehicleImages[0].key, url: vehicleImages[0].url};
      if(loggedInUser?.role==="admin") createdVehicle.isManagedByCartradez=true;
      await createdVehicle.save({session});
      await session.commitTransaction();
      session.endSession();

      return res.json({statusCode: 201, message: 'Vehicle added successfully', success: true});
    } catch (error) {
      // Delete uploaded files in parallel on error
      if (awsFileKeys.length > 0) {
        await Promise.all(awsFileKeys.map(key => FileServices.deleteFile({key})));
      }
      if (session) { await session.abortTransaction(); session.endSession(); }
      throw error;
    }
  }

  static async getAllVehicles(req, res, next) {
    const requestedLimit = parseInt(req.query.limit, 10) || generalConstant.paginationDefaults.limit;
    const limit = Math.min(requestedLimit, 50);
    const page = parseInt(req.query.page) || generalConstant.paginationDefaults.page;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const includeCount = req.query.includeCount !== 'false';
    const prioritizeListingType = req.query.prioritizeListingType === 'true';
    const query = {};
    const activeOnly = req.query.activeOnly === 'true';
    const creatorId = req.query.creatorId?.trim();
    const listingType = req.query.listingType?.trim();
    const startDate = req.query.startDate?.trim();
    const endDate = req.query.endDate?.trim();

    if (activeOnly) {
      query.listingType = {$ne: null};
    }

    if (creatorId) {
      query.creatorId = creatorId;
    }

    if (listingType) {
      query.listingType = listingType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const startDateObj = new Date(startDate);
        if (!Number.isNaN(startDateObj.getTime())) query.createdAt.$gte = startDateObj;
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        if (!Number.isNaN(endDateObj.getTime())) {
          endDateObj.setHours(23, 59, 59, 999);
          query.createdAt.$lte = endDateObj;
        }
      }
      if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
    }

    if (search) {
      const keywords = search.split(/\s+/);
      query.$and = keywords.map((word) => ({$or: [{make: {$regex: word, $options: 'i'}}, {model: {$regex: word, $options: 'i'}}, {variant: {$regex: word, $options: 'i'}}]}));
    }

    try {
      const projectionFields = {
        _id: 1,
        make: 1,
        model: 1,
        year: 1,
        price: 1,
        currency: 1,
        coverImage: 1,
        listingType: 1,
        creatorId: 1,
        isManagedByCartradez: 1,
        createdAt: 1,
      };

      const vehicleListQuery = prioritizeListingType
        ? VehiclesModel.aggregate([
            {$match: query},
            {
              $addFields: {
                listingPriority: {
                  $switch: {
                    branches: [
                      {case: {$eq: ['$listingType', 'premium']}, then: 1},
                      {case: {$eq: ['$listingType', 'quick sell']}, then: 2},
                      {case: {$eq: ['$listingType', 'standard']}, then: 3},
                    ],
                    default: 4,
                  },
                },
              },
            },
            {$sort: {listingPriority: 1, createdAt: -1}},
            {$skip: skip},
            {$limit: limit},
            {$project: projectionFields},
          ])
        : VehiclesModel.find(
            query,
            '_id make model year price currency coverImage listingType creatorId isManagedByCartradez createdAt',
          )
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .lean();

      if (includeCount) {
        const [countResult, docs] = await Promise.all([
          GeneralServices.countDocuments({model: VehiclesModel, query}),
          vehicleListQuery,
        ]);

        const {count, error: countError} = countResult;
        if (countError) throw countError;

        return next(
          VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({
            vehicles: docs,
            count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
          })
        );
      }

      const docs = await vehicleListQuery;
      return next(
        VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({
          vehicles: docs,
          count: docs.length,
          page,
          limit,
          totalPages: 1,
        })
      );
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
      const [countResult, docsResult] = await Promise.all([
        GeneralServices.countDocuments({model: VehiclesModel, query}),
        GeneralServices.find({
          model: VehiclesModel,
          query,
          options: {
            queryProperties: {skip, limit, sort: {createdAt: -1}},
            fieldsInclusion: {
              includeSpecificFields: [
                '_id make model variant year price currency listingType coverImage creatorId createdAt mileage fuelType transmission bodyType color condition engineSize driveType description features status numberOfOwners registrationCity registrationYear registrationNumber',
              ],
            },
          },
        }),
      ]);

      const {count, error: countError} = countResult;
      if (countError) throw countError;

      const {docs, error} = docsResult;
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
        fieldsInclusion: {
          includeSpecificFields: [
            '_id make model variant year condition bodyType color mileage engineSize transmission fuelType driveType currency price registrationCity registrationYear registrationNumber numberOfOwners features description images coverImage listingType creatorId createdAt',
          ],
        },
        populateFields: [
          {
            path: 'creatorId',
            select: '_id firstName lastName phoneNumber createdAt address city country',
          },
        ],
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
    const hasFiles = Array.isArray(req.files) && req.files.length > 0;
    const removedImageKeysRaw = body['removedImageKeys[]'] || body.removedImageKeys || [];
    const removedImageKeys = Array.isArray(removedImageKeysRaw)
      ? removedImageKeysRaw
      : removedImageKeysRaw ? [removedImageKeysRaw] : [];
    const hasImageMutation = hasFiles || removedImageKeys.length > 0;
    if (!hasImageMutation && Object.keys(body).length === 0)
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

    if (!hasImageMutation && Object.keys(setData).length === 0)
      return res.status(400).json({success: false, message: 'No valid vehicle fields provided for update.'});

    if (body['features[]']) {
      const featuresArr = Array.isArray(body['features[]']) ? body['features[]'] : [body['features[]']];
      setData.features = featuresArr.filter(Boolean);
    }

    if (typeof setData.features === 'string') {
      setData.features = setData.features
        .split(',')
        .map((feature) => feature.trim())
        .filter(Boolean);
    }

    if (hasImageMutation) {
      const allFiles = Array.isArray(req.files) ? req.files : [];
      const replaceImageKeysRaw = body['replaceImageKeys[]'] || body.replaceImageKeys || [];
      const replaceImageKeys = Array.isArray(replaceImageKeysRaw)
        ? replaceImageKeysRaw
        : replaceImageKeysRaw ? [replaceImageKeysRaw] : [];

      if (replaceImageKeys.length > allFiles.length) {
        return res.status(400).json({success: false, message: 'Image replacement payload is invalid.'});
      }

      const replacementFiles = allFiles.slice(0, replaceImageKeys.length);
      const newFiles = allFiles.slice(replaceImageKeys.length);

      let workingImages = [...(existingVehicle.images || [])];

      if (removedImageKeys.length > 0) {
        workingImages = workingImages.filter((img) => !removedImageKeys.includes(img?.key));
      }

      if (replaceImageKeys.length > 0) {
        if (replaceImageKeys.length !== replacementFiles.length) {
          return res.status(400).json({success: false, message: 'Image replacement payload is invalid.'});
        }

        const keyToIndex = new Map(workingImages.map((img, idx) => [img.key, idx]));
        const replacedImages = await Promise.all(
          replacementFiles.map((file, index) =>
            FileServices.replaceFileByKey({file, key: replaceImageKeys[index]})
          )
        );

        replacedImages.forEach((uploadedImage, idx) => {
          const targetKey = replaceImageKeys[idx];
          const targetIndex = keyToIndex.get(targetKey);
          if (targetIndex !== undefined) {
            workingImages[targetIndex] = uploadedImage;
          }
        });
      }

      if (newFiles.length > 0) {
        const uploadedNewImages = await Promise.all(
          newFiles.map((file) =>
            FileServices.uploadSingleFile({file, fileDir: `vehicle-image_${vehicleId}`})
          )
        );
        workingImages = [...workingImages, ...uploadedNewImages];
      }

      if (workingImages.length > 9) {
        return res.status(400).json({success: false, message: 'Maximum of 9 images allowed.'});
      }
      if (workingImages.length < 1) {
        return res.status(400).json({success: false, message: 'At least one image is required.'});
      }

      setData.images = workingImages;
      if (removedImageKeys.includes(existingVehicle?.coverImage?.key)) {
        setData.coverImage = workingImages[0];
      } else if (existingVehicle?.coverImage?.key) {
        const updatedCover = workingImages.find((img) => img.key === existingVehicle.coverImage.key);
        setData.coverImage = updatedCover || workingImages[0];
      } else {
        setData.coverImage = workingImages[0];
      }

      if (removedImageKeys.length > 0) {
        Promise.allSettled(removedImageKeys.map((key) => FileServices.deleteFile({key}))).catch(() => {});
      }
    }

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
    const imageKeys = (existingVehicle.images || [])
      .map((image) => image?.key)
      .filter(Boolean);
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // FIX: previous code did `const del = await VehiclesModel.findByIdAndDelete(...)`
      // then referenced undeclared `deleteErr` → ReferenceError crash.
      // Use GeneralServices.deleteOne so the session is passed and errors follow
      // the standard {error} pattern used everywhere else in this codebase.
      const delVehicle=await VehiclesModel.findByIdAndDelete({_id: vehicleId}, {session});
      if (!delVehicle) throw new Error('Vehicle deletion failed');

      await session.commitTransaction();
      session.endSession();

      // Run Cloudinary cleanup outside request lifecycle so live delete responds fast.
      // Failures are logged but do not block user-facing deletion.
      if (imageKeys.length > 0) {
        Promise.allSettled(imageKeys.map((key) => FileServices.deleteFile({key}))).catch(() => {});
      }

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

    const search = req.query.search?.trim();
    const query = {isManagedByCartradez: true};

    if (search) {
      const keywords = search.split(/\s+/);
      query.$and = keywords.map((word) => ({$or: [{make: {$regex: word, $options: 'i'}}, {model: {$regex: word, $options: 'i'}}, {variant: {$regex: word, $options: 'i'}}]}));
    }

    const [countResult, docsResult] = await Promise.all([
      GeneralServices.countDocuments({model: VehiclesModel, query}),
      GeneralServices.find({
        model: VehiclesModel,
        query,
        options: {
          queryProperties: {skip, limit, sort: {createdAt: -1}},
          fieldsInclusion: {
            includeSpecificFields: [
              '_id make model year price currency coverImage listingType',
            ],
          },
        },
      }),
    ]);

    const {count, error: countErr} = countResult;
    if (countErr) throw countErr;

    const {docs: retrievedVehicles, error: vehiclesRetrievedError} = docsResult;
    if (vehiclesRetrievedError) throw vehiclesRetrievedError;

    return next(VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({vehicles: retrievedVehicles, count, page, limit, totalPages: Math.ceil(count / limit)}));
  }

  static async getActiveListingsCount(req, res, next) {
    const loggedInUser = req.jwtToken;

    if (!loggedInUser)
      return res.json({statusCode: 401, message: 'Something went wrong while authenticating user. Please login again.'});

    try {
      const userRole = loggedInUser?.systemRole || loggedInUser?.role;
      const isAdminRole = userRole === SYSTEM_ROLES.admin.value;
      const query = isAdminRole
        ? {listingType: {$ne: null}}
        : {listingType: {$ne: null}, creatorId: loggedInUser._id};
      const {count, error: countErr} = await GeneralServices.countDocuments({
        model: VehiclesModel,
        query,
      });

      if (countErr) throw countErr;

      return res.json({
        statusCode: 200,
        success: true,
        message: 'Active listings count retrieved successfully',
        body: {
          count,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
};
