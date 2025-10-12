const config = require('config');

module.exports.DEFAULT_EMAIL_ADDRESS = config.get('defaultEmailAddress');
module.exports.DEFAULT_EMAIL_NAME = config.get('defaultEmailAddress');

module.exports.SENDGRID_RESET_LOGIN_TEMPLATE_ID =
  'd-07d110df82394b55b73548b1863e2322';

module.exports.SENDGRID_VERIFY_USER_TEMPLATE_ID =
  'SENDGRID_VERIFY_USER_TEMPLATE_ID';

module.exports.SENDGRID_INVITE_USER_TEMPLATE_ID =
  'SENDGRID_INVITE_USER_TEMPLATE_ID';
