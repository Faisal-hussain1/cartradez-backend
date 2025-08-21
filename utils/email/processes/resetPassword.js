const sendEmail = require('../send');

const {
  DEFAULT_EMAIL_NAME,
  DEFAULT_EMAIL_ADDRESS,
  SENDGRID_RESET_LOGIN_TEMPLATE_ID,
} = require('../../../constants/email');

module.exports = async ({user, resetUrl}) => {
  const {email, firstName, lastName} = user;
  const name = `${firstName} ${lastName}`;

  const to = {email, name};
  const from = {email: DEFAULT_EMAIL_ADDRESS, name: DEFAULT_EMAIL_NAME};
  const templateId = SENDGRID_RESET_LOGIN_TEMPLATE_ID;
  const dynamic_template_data = {name: firstName, resetUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
