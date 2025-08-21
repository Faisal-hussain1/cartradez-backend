const {
  ACCESS_LEVELS,
  ACL_ACTIONS,
  SYSTEM_ENTITIES,
} = require('../constants/aclConstants');

const checkDynamicPermissions = ({
  permissions,
  entityToCheck,
  permissionKey,
  resourcesIds,
}) => {
  const userAccessLevel = permissions.levels[entityToCheck][permissionKey];

  // Case 1: empty access level
  // GET /entities -> accessLevels.entities.view = [] -> User allowed to view some entities, but has no ids
  if (userAccessLevel?.length === 0)
    return {hasDynamicAccess: true, restrictedEntitiesIds: []};

  // Case 2: No access
  // GET /entities -> accessLevels.entities.view = None -> User not allowed to view any entity
  if (userAccessLevel.includes(ACCESS_LEVELS.none))
    return {hasDynamicAccess: false, restrictedEntitiesIds: null};

  // Case 3: Full access
  // GET /entities & resourcesIds = [a, b] -> accessLevels.entities.view = all -> User allowed to view all entities but this request is only for some
  if (userAccessLevel.includes(ACCESS_LEVELS.all))
    return {
      hasDynamicAccess: true,
      restrictedEntitiesIds: resourcesIds?.length ? resourcesIds : null, // Although the user is allowed access to all, however, their request is for specific resources so we restrict them in this request to only these to make sure no action happens on other resources by mistake
    };

  // Case 4: Specific resource check
  // GET /entities & resourcesIds = [a, b] -> accessLevels.entities.view = [a, b, c, d] -> User allowed to view some entities and only these can be accessed else if he try accessing [a, b, f] then should be rejected
  if (resourcesIds?.length > 0) {
    const allowed = resourcesIds.every((id) => userAccessLevel.includes(id));

    return {
      hasDynamicAccess: allowed,
      restrictedEntitiesIds: allowed ? resourcesIds : null,
    };
  }

  // Case 5: Collection request - return IDs for filtering
  // GET /entities -> accessLevels.entities.view = [a, b, c, d] -> User allowed to view some entities and trying to get all, then they should get access to their 4 allowed ones and nothing else
  return {
    hasDynamicAccess: true,
    restrictedEntitiesIds: userAccessLevel,
  };
};

const checkStaticPermissions = ({entityToCheck, permissionKey, role}) => {
  const entityAcl = ACL_ACTIONS[entityToCheck][permissionKey]; // Get the ACL rule for the given entity and permission key e.g { allowedRoles: [ 'admin' ], isCustom: true }
  const hasStaticAccess = entityAcl?.allowedRoles.includes(role); // Check if the user's role is allowed for this permission

  const isCustomPermissions = !!entityAcl?.isCustom; // Determine if the permission requires custom access logic
  const entityPermissionDoesNotExists = !entityAcl; // Check if the entity permission does not exist

  return {isCustomPermissions, hasStaticAccess, entityPermissionDoesNotExists};
};

function buildIdExtraQuery({originalExtraQuery, restrictedEntitiesIds}) {
  return {
    ...originalExtraQuery,
    singleActionForAllIds: restrictedEntitiesIds,
  };
}

function buildOrganizationQuery({entityToCheck, organizationId}) {
  return {
    organizationId,
    entityToCheck,
  };
}

function attachExtraQueriesFromOptions({originalQuery, options}) {
  const {extraQueries = {}} = options;
  const {organizationId, entityToCheck, singleActionForAllIds} = extraQueries;

  const inIdsArrayQuery = Array.isArray(singleActionForAllIds)
    ? {_id: {$in: singleActionForAllIds}}
    : {};

  const isUserEntity = entityToCheck === SYSTEM_ENTITIES.users.value;

  const organizationQuery = organizationId
    ? isUserEntity
      ? {'organizations.organizationId': organizationId}
      : {organizationId}
    : null;

  return {
    ...originalQuery,
    ...organizationQuery,
    ...inIdsArrayQuery,
  };
}

function extractResourcesIds({resourcesIdsValueORFunction, req}) {
  if (typeof resourcesIdsValueORFunction === 'function') {
    return resourcesIdsValueORFunction({req});
  }

  // Uncomment this if you want to support string or array as resourcesIdsValueORFunction
  // if (typeof resourcesIdsValueORFunction === 'string') {
  //   return [resourcesIdsValueORFunction];
  // }

  // if (Array.isArray(resourcesIdsValueORFunction)) {
  //   return resourcesIdsValueORFunction;
  // }

  if (req.params?._id) {
    return [req.params._id];
  }

  return [];
}

module.exports = {
  checkDynamicPermissions,
  checkStaticPermissions,
  buildIdExtraQuery,
  buildOrganizationQuery,
  attachExtraQueriesFromOptions,
  extractResourcesIds,
};
