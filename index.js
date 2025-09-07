require('dotenv').config();

const config = require('config');
const serverless = require('serverless-http');

const app = require('./app'); // keep your app.js as it is

// No sockets here 🚫

// Handle environment-specific code
if (config.get('env') === config.get('envVariables.prod')) {
  // Production-only scripts
}

if (config.get('env') === config.get('envVariables.dev')) {
  const testOnDevelopment = async () => {};

  testOnDevelopment();
}

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
