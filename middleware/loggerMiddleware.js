const config = require('config');
const winston = require('winston');
const Sentry = require('winston-transport-sentry-node').default;

const {isEnvDev} = require('../utils/general');

const {combine, timestamp, json, errors} = winston.format;

const sentryTransport = new Sentry({
  sentry: {
    // dsn: config.get('sentryDsn'),
    dsn: process.env.SENTRY_DSN,
    environment: config.get('env'),
    tracesSampleRate: 1.0,
  },
  level: 'error',
});

const transportsObj = {sentry: sentryTransport};

if (isEnvDev) {
  const consoleTransport = new winston.transports.Console({level: 'info'});
  transportsObj.console = consoleTransport;
  transportsObj.sentry.level = 'info';
}

const logger = winston.createLogger({
  level: 'info',
  exitOnError: false,
  format: combine(timestamp(), errors({stack: true}), json()),
  transports: Object.values(transportsObj),
});

module.exports = logger;
