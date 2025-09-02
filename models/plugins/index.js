const hashPasswordPlugin = require('./hashPasswordPlugin');
const hideTimestampsPlugin = require('./hideTimestampsPlugin');
const populateFieldsPlugin = require('./populateFieldsPlugin');
const showFieldsPlugin = require('./showFieldsPlugin');
const softDeleteWithIndexesPlugin = require('./softDeleteWithIndexesPlugin');

module.exports = {
  softDeleteWithIndexesPlugin,
  populateFieldsPlugin,
  hashPasswordPlugin,
  showFieldsPlugin,
  hideTimestampsPlugin,
};
