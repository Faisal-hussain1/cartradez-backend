const ErrorsFactory = require('./errors');
const MongosFactory = require('./MongoFactories');
const ResponsesFactory = require('./responses');

module.exports = {
  ...ErrorsFactory,
  ...ResponsesFactory,
  MongosFactory,
};
