const mongoose = require('./mongoose');

const UsersModel = require(`./UsersModel`);
const PermissionsModel = require(`./PermissionsModel`);
const OrganizationsModel = require('./OrganizationsModel');

module.exports = {
  mongoose,
  UsersModel,
  PermissionsModel,
  OrganizationsModel,
};
