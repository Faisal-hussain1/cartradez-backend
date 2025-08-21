const sendEmail = require('../send');

const {
  DEFAULT_EMAIL_NAME,
  DEFAULT_EMAIL_ADDRESS,
  SENDGRID_VERIFY_USER_TEMPLATE_ID,
} = require('../../../constants/email');

module.exports = async ({user, verifyUrl}) => {
  const {email, firstName, lastName} = user;
  const name = `${firstName} ${lastName}`;

  const to = {email, name};
  const from = {email: DEFAULT_EMAIL_ADDRESS, name: DEFAULT_EMAIL_NAME};
  const templateId = SENDGRID_VERIFY_USER_TEMPLATE_ID;
  const dynamic_template_data = {name: firstName, verifyUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
