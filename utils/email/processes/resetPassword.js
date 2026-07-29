const sendEmail = require('../send');

const escapeHtml = value =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildResetEmail = ({fullName, resetUrl}) => {
  const safeName = escapeHtml(fullName || 'there');
  const safeResetUrl = escapeHtml(resetUrl || '');
  const currentYear = new Date().getFullYear();
  const logoUrl =
    process.env.EMAIL_LOGO_URL ||
    'https://www.cartradez.com/images/logo-black.png';

  return `
    <div style="margin:0; padding:24px 10px; background-color:#f4f6f9;">
      <div style="max-width:320px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 12px 30px rgba(15,23,42,0.08); font-family:Arial, sans-serif; color:#1f2937;">
        <div style="padding:22px 24px 14px 24px; text-align:center; border-bottom:1px solid #e5e7eb;">
          <img src="${logoUrl}" alt="CarTradez" style="display:block; width:64px; height:auto; margin:0 auto;" />
        </div>
        <div style="padding:16px 18px 14px 18px; border-bottom:1px solid #e5e7eb;">
          <table role="presentation" style="border-collapse:collapse; width:100%;">
            <tr>
              <td style="width:30px; vertical-align:middle;">
                <div style="width:22px; height:22px; border-radius:6px; background:#eef4ff; border:1px solid #cddcff; display:block; color:#1d4ed8; font-size:14px; font-weight:700; line-height:22px; text-align:center;">
                  &#128274;
                </div>
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:18px; font-weight:700; line-height:1.2; color:#1f2a44;">
                  Reset Your Password
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding:16px 18px 12px 18px;">
          <p style="margin:0 0 12px 0; font-size:14px; line-height:1.55; font-weight:700; color:#111827;">
            Hello ${safeName},
          </p>
          <p style="margin:0 0 12px 0; font-size:14px; line-height:1.55; color:#344054;">
            We received a request to reset the password for your CarTradez account.
          </p>
          <div style="border:1px solid #d9e2ef; border-radius:10px; background:#f8fbff; padding:18px 14px 14px 14px; margin:0 0 14px 0; text-align:center;">
            <div style="width:34px; height:34px; border-radius:999px; margin:0 auto 10px auto; border:1px solid #d1d7ea; color:#1d4ed8; background:#ffffff; font-size:16px; font-weight:700; line-height:34px; text-align:center;">
              &#128737;
            </div>
            <div style="font-size:14px; font-weight:700; line-height:1.4; color:#111827; margin:0 0 8px 0;">
              Secure Password Reset
            </div>
            <div style="font-size:12px; line-height:1.6; color:#5f6b80; margin:0 0 12px 0;">
              Use the secure button below to choose a new password.
            </div>
            <a href="${safeResetUrl}" style="display:inline-block; min-width:120px; text-align:center; background:#0f4c8a; color:#ffffff; text-decoration:none; font-weight:700; font-size:12px; padding:11px 18px; border-radius:5px;">
              Reset Password <span style="margin-left:8px; font-size:13px;">&#8594;</span>
            </a>
          </div>
          <p style="margin:0 0 8px 0; font-size:11px; line-height:1.55; color:#7c8aa0;">
            If the button does not work, copy and paste this link:
          </p>
          <p style="margin:0 0 12px 0; font-size:10px; line-height:1.5; word-break:break-all;">
            <a href="${safeResetUrl}" style="color:#0f4c8a; text-decoration:none;">${safeResetUrl}</a>
          </p>
          <p style="margin:0; font-size:10px; line-height:1.6; color:#7c8aa0; text-align:center;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
        <div style="padding:10px 18px 14px 18px; border-top:1px solid #e5e7eb; text-align:left;">
          <p style="margin:0 0 4px 0; font-size:12px; line-height:1.5; color:#111827;">Regards,</p>
          <p style="margin:0; font-size:12px; line-height:1.5; color:#111827; font-weight:700;">CarTradez Team</p>
        </div>
        <div style="padding:18px 18px 22px 18px; background:#fafbfc; border-top:1px solid #e5e7eb; text-align:center;">
          <p style="margin:0 0 8px 0; font-size:10px; line-height:1.5; color:#7c8aa0;">
            This automated security email was sent by CarTradez. Please do not reply directly.
          </p>
          <p style="margin:0 0 8px 0; font-size:10px; line-height:1.5; color:#7c8aa0;">
            <a href="https://www.cartradez.com/privacy" style="color:#7c8aa0; text-decoration:none;">Privacy Policy</a>
            <span style="color:#c0c7d2;">&nbsp;&middot;&nbsp;</span>
            <a href="https://www.cartradez.com/terms" style="color:#7c8aa0; text-decoration:none;">Terms of Service</a>
          </p>
          <p style="margin:0; font-size:10px; line-height:1.5; color:#8a97aa;">
            &copy; ${currentYear} CarTradez. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
};

module.exports = async ({user, resetUrl}) => {
  const {email, firstName, lastName} = user;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const html = buildResetEmail({
    fullName,
    resetUrl,
  });

  await sendEmail({
    to: email,
    subject: 'Reset Your CarTradez Password',
    html,
    text: [
      `Hello ${fullName || 'there'},`,
      '',
      'We received a request to reset the password for your CarTradez account.',
      `Reset your password: ${resetUrl}`,
      '',
      'If you did not request a password reset, you can safely ignore this email.',
      '',
      'Regards,',
      'CarTradez Team',
    ].join('\n'),
  });
};
