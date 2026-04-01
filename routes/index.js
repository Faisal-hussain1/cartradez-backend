const usersRoute = require(`./usersRoute`);
const publicRoute = require(`./publicRoute`);
const privateRoute = require(`./privateRoute.js`);
const entitiesRoute = require(`./entitiesRoute.js`);
const vehiclesRoute = require('./vehiclesRoutes.js');
const paymentRoute=require('./paymentRoute.js');
const chatRoute=require("./chatRouter.js");

module.exports = {
  usersRoute,
  publicRoute,
  privateRoute,
  entitiesRoute,
  vehiclesRoute,
  paymentRoute,
  chatRoute,
};
