const {mongoose} = require('mongoose');

const {generalConstant} = require('../constants');

const {
  VehiclesResponsesFactory,
  VehiclesErrorsFactory,
} = require('../factories');
const {FileServices, GeneralServices} = require('../services');
const VehiclesModel = require('../models/VehiclesModel');
const {getCurrentTimestamp} = require('../utils/dateUtils');

const {
  VEHICLE_ACTIONS,
  VEHICLE_STATUSES,
} = require('../constants/vehicleConstants');
const {SYSTEM_ROLES} = require('../constants/usersConstants');

module.exports = class VehiclesController {
  static async addNewVehicle(req, res, next) {
    const data = req.body;

    const loggedInUser = req.jwtToken.user;

    const isAdminRole =
      loggedInUser.currentActiveOrganization.role === SYSTEM_ROLES.admin.value;

    if (isAdminRole) data.isManagedByCartradez = true;

    let session;
    let awsFileKeys = [];
    let createdVehicleId;
    let vehicleImages = [];

    if (req?.files && req.files.length < 3)
      return next(VehiclesErrorsFactory.vehicleLessImagesErr());

    try {
      data.creatorId = loggedInUser._id;
      data.organizationId = loggedInUser.currentActiveOrganization._id;
      data.events = [
        {
          action: VEHICLE_ACTIONS.created.value,
          userId: loggedInUser._id,
          timestamp: getCurrentTimestamp(),
        },
      ];
      data.features = data.features || [];

      session = await mongoose.startSession();
      session.startTransaction();

      const {doc: createdVehicle, error: vehicleCreationError} =
        await GeneralServices.create({
          model: VehiclesModel,
          data: data,
          session,
        });

      if (vehicleCreationError) throw vehicleCreationError;

      createdVehicleId = createdVehicle._id;

      if (req?.files && req.files.length > 0) {
        let image;
        for (const file of req.files) {
          image = await FileServices.uploadSingleFile({
            file: file,
            fileDir: `vehicle-image_${createdVehicle._id}`,
          });

          awsFileKeys.push(image.key);
          vehicleImages.push(image);
        }
      }

      createdVehicle.images = vehicleImages;
      createdVehicle.coverImage = {
        key: vehicleImages[0].key,
        url: vehicleImages[0].url,
      };
      await createdVehicle.save({session});

      await session.commitTransaction();
      session.endSession();

      return next(VehiclesResponsesFactory.vehicleAddedSuccessfully());
    } catch (error) {
      if (awsFileKeys.length > 0) {
        for (const awsFileKey of awsFileKeys) {
          await FileServices.deleteFile({
            key: `vehicle-image_${createdVehicleId}/${awsFileKey}`,
          });
        }
      }

      if (session) {
        await session.abortTransaction();
        session.endSession();
      }

      throw error;
    }
  }

  static async getAllVehicles(req, res, next) {
    const listingTypeLimit = 10; //This is for now

    const limit =
      parseInt(req.query.limit) || generalConstant.paginationDefaults.limit;

    const page =
      parseInt(req.query.page) || generalConstant.paginationDefaults.page;

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim();

    const queryBase = {};

    if (search) {
      const keywords = search.split(/\s+/);
      queryBase.$and = keywords.map((word) => ({
        $or: [
          {make: {$regex: word, $options: 'i'}},
          {model: {$regex: word, $options: 'i'}},
          {variant: {$regex: word, $options: 'i'}},
        ],
      }));
    }

    const types = ['standard', 'premium', 'quickSell'];
    const perTypeLimit = listingTypeLimit;
    let allVehicles = [];

    for (const type of types) {
      const {docs} = await GeneralServices.find({
        model: VehiclesModel,
        query: {...queryBase, listingType: type},
        options: {
          ...req.getUsersInclusionOptions,
          queryProperties: {
            limit: perTypeLimit,
            sort: {createdAt: -1},
          },
          fieldsInclusion: {
            includeSpecificFields: [
              '_id make model year price currency coverImage listingType',
            ],
          },
        },
      });

      if (docs?.length) allVehicles.push(...docs);
    }

    const totalResults = allVehicles.length;

    const typePriority = {standard: 1, premium: 2, quickSell: 3};
    allVehicles.sort((a, b) => {
      return typePriority[a.listingType] - typePriority[b.listingType];
    });

    const paginatedVehicles = allVehicles.slice(skip, skip + limit);

    const totalPages = Math.ceil(totalResults / limit);

    return next(
      VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({
        vehicles: paginatedVehicles,
        count: totalResults,
        page,
        limit,
        totalPages,
      })
    );
  }

  static async getVehicle(req, res, next) {
    const vehicleId = req.params.id;

    const {doc: retrievedVehicle, error: gettingVehicleErr} =
      await GeneralServices.findOne({
        model: VehiclesModel,
        query: {_id: vehicleId},
        options: {
          fieldsInclusion: {include: ['createdAt']},
          populateFields: [
            {
              path: 'creatorId',
              select:
                '_id firstName lastName phoneNumber organizations createdAt',
            },
          ],
        },
      });

    if (gettingVehicleErr) throw gettingVehicleErr;

    if (!retrievedVehicle)
      return next(VehiclesErrorsFactory.vehicleNotFoundErr());

    const {count, error: countVehiclesErr} =
      await GeneralServices.countDocuments({
        model: VehiclesModel,
        query: {
          $and: [
            {creatorId: retrievedVehicle.creatorId._id},
            {status: VEHICLE_STATUSES.active.value},
          ],
        },
      });

    if (countVehiclesErr) throw countVehiclesErr;

    retrievedVehicle.creatorId = {
      ...(retrievedVehicle.creatorId.toObject?.() ||
        retrievedVehicle.creatorId),
      totalActiveVehicles: count,
    };

    return next(
      VehiclesResponsesFactory.vehicleRetrievedSuccessfully({
        vehicle: retrievedVehicle,
      })
    );
  }

  static async getAllManagedByCartradezVehicles(req, res, next) {
    const limit =
      parseInt(req.query.limit) || generalConstant.paginationDefaults.limit;

    const page =
      parseInt(req.query.page) || generalConstant.paginationDefaults.page;

    const skip = (page - 1) * limit;

    const {count, error: countErr} = await GeneralServices.countDocuments({
      model: VehiclesModel,
      query: {isManagedByCartradez: true},
    });

    if (countErr) throw countErr;

    const search = req.query.search?.trim();

    const query = {isManagedByCartradez: true};

    if (search) {
      const keywords = search.split(/\s+/); // split by space(s)

      query.$and = keywords.map((word) => ({
        $or: [
          {make: {$regex: word, $options: 'i'}},
          {model: {$regex: word, $options: 'i'}},
          {variant: {$regex: word, $options: 'i'}},
        ],
      }));
    }

    const {docs: retrievedVehicles, error: vehiclesRetrievedError} =
      await GeneralServices.find({
        model: VehiclesModel,
        query,
        options: {
          queryProperties: {
            skip,
            limit,
            sort: {createdAt: -1},
          },
          fieldsInclusion: {
            includeSpecificFields: ['_id make model price currency coverImage'],
          },
        },
      });

    if (vehiclesRetrievedError) throw vehiclesRetrievedError;

    return next(
      VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({
        vehicles: retrievedVehicles,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      })
    );
  }
};
