require('dotenv').config();
const config = require('config');
const serverless = require('serverless-http');

const app = require('./app');

// === Environment-based code ===
if (config.get('env') === config.get('envVariables.prod')) {
  console.warn('Running in production mode');
}

if (config.get('env') === config.get('envVariables.dev')) {
  const testOnDevelopment = async () => {
    console.warn('Running in development mode');
  };
  testOnDevelopment();
}

// === Local run (node index.js) ===
if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () =>
    console.warn(`Ready! Available at http://localhost:${port}`)
  );
}

// === Export wrapped handler for Vercel ===
module.exports = serverless(app);
