const {AuthErrors, GeneralErrorsFactory} = require('../factories');
const {PermissionsModel} = require('../models');
const {GeneralServices} = require('../services');
const {aclUtils} = require('../utils');

module.exports =
  ({permissionKey, entityToCheck, resourcesIdsValueORFunction}) =>
  async (req, _, next) => {
    try {
      const resourcesIds = aclUtils.extractResourcesIds({
        resourcesIdsValueORFunction,
        req,
      });

      const userId = req.jwtToken.user._id;
      const {role, organizationId} =
        req.jwtToken.user.currentActiveOrganization;

      req.extraQueries = aclUtils.buildOrganizationQuery({
        entityToCheck,
        organizationId,
      });

      const {
        isCustomPermissions,
        hasStaticAccess,
        entityPermissionDoesNotExists,
      } = aclUtils.checkStaticPermissions({
        entityToCheck,
        permissionKey,
        role,
      }); // Check if the user has static access to the entity (check permissions from the ACL constants)

      if (entityPermissionDoesNotExists)
        return next(
          GeneralErrorsFactory.badRequestErr({
            customMessage: 'Permission does not exist',
          })
        );

      if (!hasStaticAccess) return next(AuthErrors.unauthorized());

      if (!isCustomPermissions) {
        // If is not custom permission, then the user have access by default, but if they provide resourcesIds, then we need to restrict their action to only those provided ids.
        if (resourcesIds)
          req.extraQueries = aclUtils.buildIdExtraQuery({
            restrictedEntitiesIds: resourcesIds,
            originalExtraQuery: req.extraQueries,
          });

        return next();
      }

      const {doc: permissions, error} = await GeneralServices.findOne({
        model: PermissionsModel,
        query: {userId, organizationId},
      });
      if (error) throw error;
      if (!permissions) return next(AuthErrors.unauthorized());

      const {hasDynamicAccess, restrictedEntitiesIds} =
        aclUtils.checkDynamicPermissions({
          permissions,
          entityToCheck,
          permissionKey,
          resourcesIds,
        }); // Check if the user has dynamic access to the entity (check permissions from the permissions model)

      if (!hasDynamicAccess) return next(AuthErrors.unauthorized());

      // Add IDs to request for controller filtering
      if (restrictedEntitiesIds)
        req.extraQueries = aclUtils.buildIdExtraQuery({
          restrictedEntitiesIds,
          originalExtraQuery: req.extraQueries,
        });

      next();
    } catch (error) {
      return next(GeneralErrorsFactory.internalErr());
    }
  };
