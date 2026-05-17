// const sendEmail = require('../send');

// const {
//   DEFAULT_NAME,
//   DEFAULT_EMAIL_ADDRESS,
//   SENDGRID_RESET_LOGIN_TEMPLATE_ID,
// } = require('../../../constants/email');

// module.exports = async ({user, resetUrl}) => {
//   const {email, firstName, lastName} = user;

//   const name = `${firstName} ${lastName}`;

//   const to = {email, name};
//   const from = {email: DEFAULT_EMAIL_ADDRESS, name: DEFAULT_NAME};
//   const templateId = SENDGRID_RESET_LOGIN_TEMPLATE_ID;
//   const dynamic_template_data = {name, resetUrl};

//   await sendEmail({to, from, templateId, dynamic_template_data});
// };






const sendEmail = require('../send');
const emailTemplate = require('../template');

module.exports = async ({user, resetUrl}) => {
  const {email, firstName, lastName} = user;

  const name = `${firstName} ${lastName}`;

  const bodyContent = `
    <p style="margin: 0 0 12px 0;">Hello ${name},</p>
    <p style="margin: 0 0 12px 0;">We received a request to reset your CarTradez account password.</p>
    <p style="margin: 0 0 12px 0;">Use the button below to choose a new password.</p>
    <p style="margin: 0;">If you did not request this, you can safely ignore this email.</p>
  `;

  const html = emailTemplate({
    title: 'Password Reset Request',
    bodyContent,
    ctaText: 'Reset Password',
    ctaUrl: resetUrl,
  });

  await sendEmail({
    to: email,
    subject: 'Reset Your CarTradez Password',
    html,
  });
};
