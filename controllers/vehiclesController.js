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
    const loggedInUser = req.jwtToken;
    if (!loggedInUser) {
  return res.json({
    statusCode: 401,
    message: "Something went wrong while authenticating user. Please login again.",
  });
}


    const isAdminRole =
      loggedInUser.role === SYSTEM_ROLES.admin.value;

    if (isAdminRole) data.isManagedByCartradez = true;

    let session;
    let awsFileKeys = [];
    let createdVehicleId;
    let vehicleImages = [];

    if (req?.files && req.files.length < 3)
      return next(VehiclesErrorsFactory.vehicleLessImagesErr());
    if (req?.files && req.files.length > 9)
      return next(VehiclesErrorsFactory.vehicleMoreImagesErr());

    try {
      data.creatorId = loggedInUser?._id;
      data.events = [
        {
          action: VEHICLE_ACTIONS.created.value,
          userId: loggedInUser?._id,
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
      if (!createdVehicle) throw new Error("Vehicle creation failed");

      createdVehicleId = createdVehicle?._id.toString();


      if (req?.files && req.files.length > 0) {
        let image;
        for (const file of req.files) {
          image = await FileServices.uploadSingleFile({
            file: file,
            fileDir: `vehicle-image_${createdVehicleId}`,
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
      
      if(createdVehicle._id)  return res.json({statusCode:201,message:"Vehicle added successfully",success:true})
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
  const limit =
    parseInt(req.query.limit) || generalConstant.paginationDefaults.limit;

  const page =
    parseInt(req.query.page) || generalConstant.paginationDefaults.page;

  const skip = (page - 1) * limit;

  const search = req.query.search?.trim();

  const query = {};

  // Search filter
  if (search) {
    const keywords = search.split(/\s+/);

    query.$and = keywords.map((word) => ({
      $or: [
        { make: { $regex: word, $options: "i" } },
        { model: { $regex: word, $options: "i" } },
        { variant: { $regex: word, $options: "i" } },
      ],
    }));
  }

  try {
    // Get total count
    const { count, error: countError } =
      await GeneralServices.countDocuments({
        model: VehiclesModel,
        query,
      });

    if (countError) throw countError;

    // Get paginated vehicles
    const { docs, error } = await GeneralServices.find({
      model: VehiclesModel,
      query,
      options: {
        queryProperties: {
          skip,
          limit,
          sort: { createdAt: -1 },
        },
        fieldsInclusion: {
          includeSpecificFields: [
            "_id make model year price currency coverImage listingType creatorId isManagedByCartradez",
          ],
        },
      },
    });

    if (error) throw error;

    return next(
      VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({
        vehicles: docs,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      })
    );
  } catch (err) {
    return next(err);
  }
}

static async getAllVehiclesOfLoggedInUser(req, res, next) {
  const limit =
    parseInt(req.query.limit) || generalConstant.paginationDefaults.limit;

  const page =
    parseInt(req.query.page) || generalConstant.paginationDefaults.page;

  const skip = (page - 1) * limit;

  const loggedInUserId = req.user?._id;  // assuming auth middleware sets this
  const userId=req.params.id;

  if (!loggedInUserId==userId) {
    return next(new Error("Unauthorized"));
  }

  try {
    const query={createrId:loggedInUserId}
    const { count, error: countError } =
      await GeneralServices.countDocuments({
        model: VehiclesModel,
        query,
      });

    if (countError) throw countError;

    // Get paginated vehicles for logged in user
    const { docs, error } = await GeneralServices.findAllByUserId({
      model: VehiclesModel,
    query,
      options: {
        queryProperties: {
          skip,
          limit,
          sort: { createdAt: -1 },
        },
      },
    });

    if (error) throw error;

    return next(
      VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({
        vehicles: docs,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      })
    );
  } catch (err) {
    return next(err);
  }
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
                '_id firstName lastName phoneNumber organizations createdAt listingType address city country',
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
