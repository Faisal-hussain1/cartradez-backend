const sendEmail = require('../send');

module.exports = async ({user, verifyUrl}) => {
  const html = `
    <h2>Welcome to CarTradez</h2>

    <p>Hello ${user.firstName} ${user.lastName},</p>

    <p>Please verify your account by clicking below:</p>

    <a href="${verifyUrl}"
       style="padding:10px 20px;background:#2563eb;color:white;text-decoration:none;">
       Verify Account
    </a>

    <p>If you didn't register, ignore this email.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Verify Your CarTradez Account',
    html,
  });
};
