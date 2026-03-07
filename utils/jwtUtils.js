const jwt = require('jsonwebtoken');

const {generalConstant} = require('../constants');
const {getTokenHeaderName} = require('./getTokenHeaderUtils');

module.exports.generateToken = ({payload, expiry}) => {
  const secret = process.env.JWT_SECRET;
  const options = {expiresIn: expiry || generalConstant.tokenExpirationTime};

  const token = jwt.sign(payload, secret, options);

  return token;
};

module.exports.verifyToken = ({token}) => {
  try {
    const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
    return decodedObj;
  } catch (error) {
    return false;
  }
};

module.exports.getToken = ({cookieStr}) => {
  if (!cookieStr) return null;

  const cookies = cookieStr.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=');

    prev[name] = value.join('=');

    return prev;
  }, {});

  return cookies[getTokenHeaderName()];
};
