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

module.exports = async ({user, resetUrl}) => {
  const {email, firstName, lastName} = user;

  const name = `${firstName} ${lastName}`;

  const html = `
    <h2>Password Reset - CarTradez</h2>

    <p>Hello ${name},</p>

    <p>You requested to reset your password.</p>

    <p>Click below to set a new password:</p>

    <a href="${resetUrl}"
       style="padding:10px 20px;background:#2563eb;color:white;text-decoration:none;">
       Reset Password
    </a>

    <p>If you didn't request this, please ignore this email.</p>

    <p>Thanks,<br/>CarTradez Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your CarTradez Password',
    html,
  });
};
