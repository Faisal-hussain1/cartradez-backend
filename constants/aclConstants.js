const {SYSTEM_ROLES} = require('./usersConstants');

const SYSTEM_ENTITIES = {
  organization: {value: 'organization'},
  users: {value: 'users'},
  entities: {value: 'entities'},
};

const extractValues = ({obj}) =>
  Object.fromEntries(Object.entries(obj).map(([key, obj]) => [key, obj.value]));

const {users, organization, entities} = extractValues({obj: SYSTEM_ENTITIES});
const {admin, employee} = extractValues({obj: SYSTEM_ROLES});

const ACL_ACTIONS = {
  [users]: {
    create: {
      allowedRoles: [admin],
      isCustom: false,
    },
    view: {
      allowedRoles: [admin],
      isCustom: true,
    },

    update: {
      allowedRoles: [admin, employee],
      isCustom: true,
    },
    remove: {
      allowedRoles: [admin],
      isCustom: false,
    },
    inviteUser: {
      allowedRoles: [admin],
      isCustom: false,
    },
  },
  [organization]: {
    create: {
      allowedRoles: [admin],
      isCustom: false,
    },
    view: {
      allowedRoles: [admin, employee],
      isCustom: false,
    },
    update: {
      allowedRoles: [admin],
      isCustom: false,
    },
    remove: {
      allowedRoles: [admin],
      isCustom: false,
    },
  },

  [entities]: {
    create: {
      allowedRoles: [admin, employee],
      isCustom: false,
    },
    view: {
      allowedRoles: [admin, employee],
      isCustom: true,
    },
    update: {
      allowedRoles: [admin, employee],
      isCustom: true,
    },
    remove: {
      allowedRoles: [admin],
      isCustom: false,
    },
  },
};

const CRUD_ACTIONS = {
  create: 'CREATE',
  view: 'VIEW',
  update: 'UPDATE',
  remove: 'REMOVE',
};

const ACCESS_LEVELS = {
  all: 'ALL',
  none: 'NONE',
};

module.exports = {
  ACL_ACTIONS,
  SYSTEM_ENTITIES,
  ACCESS_LEVELS,
  CRUD_ACTIONS,
};
