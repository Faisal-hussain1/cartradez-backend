const bcrypt = require('bcrypt');

module.exports.saltHashPassword = async ({password}) =>
  await bcrypt.hash(password, 10);

module.exports.verify = async ({inputPassword, dbPassword}) =>
  await bcrypt.compare(inputPassword, dbPassword);
