const sendEmail = require('../send');

module.exports = async ({ user, verifyUrl }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; line-height: 1.6;">
      
      <h2 style="color: #1f2937; margin-bottom: 10px;">
        Welcome to CarTradez
      </h2>

      <p>
        Hello ${user.firstName} ${user.lastName},
      </p>

      <p>
        Thank you for creating your account with <strong>CarTradez</strong>. 
        We are excited to have you on board.
      </p>

      <p>
        To complete your registration and activate your account, please verify your email address by clicking the button below.
      </p>

      <div style="margin: 30px 0;">
        <a href="${verifyUrl}"
          style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Verify My Account
        </a>
      </div>

      <p>
        Once verified, you will be able to log in and start using CarTradez services.
      </p>

      <p style="font-size: 14px; color: #4b5563;">
        If the button above does not work, copy and paste the following link into your browser:
      </p>

      <p style="font-size: 14px; word-break: break-all;">
        <a href="${verifyUrl}" style="color: #2563eb;">
          ${verifyUrl}
        </a>
      </p>

      <p style="font-size: 14px; color: #4b5563;">
        If you did not create this account, you can safely ignore this email. No further action is required.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

      <p style="font-size: 13px; color: #6b7280;">
        Regards,<br />
        <strong>CarTradez Team</strong>
      </p>

    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Verify Your CarTradez Account',
    html,
  });

  return true;
};