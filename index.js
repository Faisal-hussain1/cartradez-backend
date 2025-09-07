require('dotenv').config();
const config = require('config');

const app = require('./app');

// === Environment-based code ===
if (config.get('env') === config.get('envVariables.prod')) {
  // Production-only logic here
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

// === Export app for Vercel ===
module.exports = app;
