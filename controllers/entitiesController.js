const mongoose = require('mongoose');

const {SYSTEM_ROLES} = require('../constants/usersConstants');
const {GeneralResponsesFactory, GeneralErrorsFactory} = require('../factories');
const EntitiesModel = require('../models/EntitiesModel');

const {
  GeneralServices,
  EntitiesServices,
  PermissionsServices,
} = require('../services');
const {createOptions} = require('../utils');

const checkIsRoleAdmin = ({role}) => role === SYSTEM_ROLES.admin.value;

module.exports = class EntitiesController {
  static async create(req, res, next) {
    const {user} = req.jwtToken;
    const {permissions, role, organizationId} = user.currentActiveOrganization;

    const isAdmin = checkIsRoleAdmin({role});

    // No transaction needed for admin (single write)
    const session = isAdmin ? null : await mongoose.startSession();
    if (session) session.startTransaction();

    try {
      const {doc: entity, error} = await GeneralServices.create({
        model: EntitiesModel,
        data: {
          title: req.body.title,
          userId: user._id,
          organizationId,
        },
        session,
      });
      if (error) throw error;

      if (!isAdmin) {
        // if not admin, we need to update permissions because we are using custom permissions for non admins and admins has all permissions
        const {error: permissionUpdateError} =
          await PermissionsServices.updatePermissions({
            _id: permissions,
            entityToUpdate: 'entities',
            updatedValues: {view: entity._id, update: entity._id},
            session,
          });

        if (permissionUpdateError) throw permissionUpdateError;
        await session.commitTransaction();
      }

      next(
        GeneralResponsesFactory.dataSavedSuccessfully({
          data: entity,
          key: 'entity',
        })
      );
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  static async getAllEntities(req, res, next) {
    const {success, docs, error} = await EntitiesServices.getAllEntities({
      model: EntitiesModel,
      options: createOptions({
        extraQueries: req.extraQueries,
        originalOptions: {includeDeleted: true},
      }),
    });

    if (!success) throw error;
    if (docs) {
      next(
        GeneralResponsesFactory.dataRetrievedSuccessfully({
          data: docs,
          key: 'entities',
        })
      );
    } else {
      throw GeneralErrorsFactory.notFoundErr();
    }
  }

  static async updateManyEntities(req, res, next) {
    const {docs, error, areDocumentsUpdated} =
      await GeneralServices.findAllAndUpdate({
        data: req.body.data,
        model: EntitiesModel,
        options: createOptions({extraQueries: req.extraQueries}),
        query: {
          _id: {
            $in: req.body.ids,
          },
        },
      });

    if (error) throw error;
    if (docs && areDocumentsUpdated)
      next(
        GeneralResponsesFactory.dataUpdatedSuccessfully({
          data: docs,
          key: 'entities',
        })
      );
    else throw GeneralErrorsFactory.notFoundErr();
  }

  static async deleteManyEntities(req, res, next) {
    const {docs, error, areDocumentsDeleted} =
      await GeneralServices.findAllAndDelete({
        model: EntitiesModel,
        options: createOptions({
          extraQueries: req.extraQueries,
          originalOptions: {hardDelete: true},
        }),
        query: {
          _id: {$in: req.body.ids},
        },
      });

    if (error) throw error;
    if (docs && areDocumentsDeleted)
      next(
        GeneralResponsesFactory.dataDeletedSuccessfully({
          data: docs,
          key: 'entities',
        })
      );
    else throw GeneralErrorsFactory.notFoundErr();
  }
};
