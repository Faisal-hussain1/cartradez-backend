const sendEmail = require('../send');

const {
  DEFAULT_EMAIL_ADDRESS,
  DEFAULT_EMAIL_NAME,
  SENDGRID_INVITE_USER_TEMPLATE_ID,
} = require('../../../constants/email');

module.exports = async ({user, url}) => {
  const {email} = user;

  const to = {email};
  const from = {email: DEFAULT_EMAIL_ADDRESS, name: DEFAULT_EMAIL_NAME};
  const templateId = SENDGRID_INVITE_USER_TEMPLATE_ID;
  const dynamic_template_data = {url};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
