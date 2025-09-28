const {mongoose} = require('mongoose');

const {generalConstant} = require('../constants');

const {
  VehiclesResponsesFactory,
  VehiclesErrorsFactory,
} = require('../factories');
const {FileServices, GeneralServices} = require('../services');
const {prepareVehiclesData} = require('../utils/vehiclesUtils');
const VehiclesModel = require('../models/VehiclesModel');

module.exports = class VehiclesController {
  static async addNewVehicle(req, res, next) {
    const data = req.body;

    // const loggedInUser = req.jwtToken.user;

    let session;
    let awsFileKeys = [];
    let createdVehicleId;
    let vehicleImages = [];

    if (req?.files && req.files.length < 3)
      return next(VehiclesErrorsFactory.vehicleLessImagesErr());

    try {
      // data.creatorId = loggedInUser._id;
      // data.events = [
      //   {
      //     action: VEHICLE_ACTIONS.created.value,
      //     userId: loggedInUser._id,
      //     timestamp: getCurrentTimestamp(),
      //   },
      // ];

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
        let profileImage;
        for (const file of req.files) {
          profileImage = await FileServices.uploadSingleFile({
            file: file,
            fileDir: `profile-image_${createdVehicle._id}`,
          });

          awsFileKeys.push(profileImage.key);
          vehicleImages.push(profileImage);
        }
      }

      createdVehicle.images = vehicleImages;
      await createdVehicle.save({session});

      await session.commitTransaction();
      session.endSession();

      return next(VehiclesResponsesFactory.vehicleAddedSuccessfully());
    } catch (error) {
      if (awsFileKeys.length > 0) {
        for (const awsFileKey of awsFileKeys) {
          await FileServices.deleteFile({
            key: `profile-image_${createdVehicleId}/${awsFileKey}`,
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

    const {count, error: countErr} = await GeneralServices.countDocuments({
      model: VehiclesModel,
      query: {},
    });

    if (countErr) throw countErr;

    const query = {
      ...(req.query.search && {
        $or: [
          {
            model: {
              $regex: req.query.search.trim(),
              $options: 'i',
            },
          },
        ],
      }),
    };

    const {docs: retrievedVehicles, error: vehiclesRetrievedError} =
      await GeneralServices.find({
        model: VehiclesModel,
        query,
        options: {
          ...req.getUsersInclusionOptions,
          queryProperties: {
            skip,
            limit,
            sort: {createdAt: -1},
          },
        },
      });

    if (vehiclesRetrievedError) throw vehiclesRetrievedError;

    const preparedVehicles = prepareVehiclesData({
      data: retrievedVehicles,
    });

    return next(
      VehiclesResponsesFactory.vehiclesRetrievedSuccessfully({
        vehicles: preparedVehicles,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      })
    );
  }

  static async getVehicle(req, res, next) {
    const vehicleId = req.params.id;

    const {doc: retrievedVehicle, error: gettingVehicleErr} =
      await GeneralServices.findOne({
        model: VehiclesModel,
        query: {_id: vehicleId},
      });

    if (gettingVehicleErr) throw gettingVehicleErr;

    if (!retrievedVehicle)
      return next(VehiclesErrorsFactory.vehicleNotFoundErr());

    return next(
      VehiclesResponsesFactory.vehicleRetrievedSuccessfully({
        vehicle: retrievedVehicle,
      })
    );
  }
};
