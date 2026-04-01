const {isMainThread} = require('worker_threads');

const config = require('config');

const mongoose = require('mongoose');

const logger = require('../middleware/loggerMiddleware');
const dns=require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);

let conn;

if (isMainThread) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.get(`mongoUri`));
  conn = mongoose.connection;

  conn.on('error', () => logger.error('MongoDB connection error'));

  conn.on('open', () => logger.info('Connected to MongoDB'));
}

module.exports = conn;
