const sendEmail = require('../send');

const escapeHtml = value =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildVerifyEmail = ({fullName, verifyUrl}) => {
  const safeName = escapeHtml(fullName || 'there');
  const safeVerifyUrl = escapeHtml(verifyUrl || '');
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
                  &#9993;
                </div>
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:18px; font-weight:700; line-height:1.2; color:#1f2a44;">
                  Welcome to CarTradez
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
            We&apos;re thrilled to have you! You&apos;re now part of the fastest-growing community of automotive enthusiasts and trusted dealers.
          </p>
          <p style="margin:0 0 14px 0; font-size:14px; line-height:1.55; color:#344054;">
            Please verify your account to unlock full access to buying, listing, and getting premium market insights.
          </p>
          <div style="border:1px solid #d9e2ef; border-radius:10px; background:#f8fbff; padding:18px 14px 14px 14px; margin:0 0 14px 0; text-align:center;">
            <table role="presentation" align="center" width="36" height="36" cellpadding="0" cellspacing="0" border="0" style="width:36px; height:36px; margin:0 auto 10px auto; border-collapse:separate;">
              <tr>
                <td align="center" valign="middle" width="34" height="34" style="width:34px; height:34px; padding:0; border:1px solid #d1d7ea; border-radius:999px; background:#ffffff; color:#1d4ed8; font-family:'Segoe UI Symbol','Arial Unicode MS',Arial,sans-serif; font-size:16px; font-weight:700; line-height:34px; text-align:center; vertical-align:middle;">
                  &#128737;&#65038;
                </td>
              </tr>
            </table>
            <div style="font-size:14px; font-weight:700; line-height:1.4; color:#111827; margin:0 0 8px 0;">
              Secure Your Account
            </div>
            <div style="font-size:12px; line-height:1.6; color:#5f6b80; margin:0 0 12px 0;">
              Click the button below to confirm your email address.
            </div>
            <a href="${safeVerifyUrl}" style="display:inline-block; min-width:120px; text-align:center; background:#0f4c8a; color:#ffffff; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:-0.1px; padding:11px 18px; border-radius:5px;">
              Verify Account <span style="margin-left:10px; font-size:13px; line-height:1;">&#8594;</span>
            </a>
          </div>
          <table role="presentation" style="border-collapse:collapse; width:100%; margin:0 0 12px 0;">
            <tr>
              <td style="width:50%; padding-right:6px; vertical-align:top;">
                <table role="presentation" style="border-collapse:collapse;">
                  <tr>
                    <td style="width:22px; vertical-align:top; padding-top:2px; color:#6f7cf7; font-size:14px; line-height:1;">&#128269;</td>
                    <td style="padding-left:6px;">
                      <div style="font-size:10px; font-weight:700; color:#1f2937; line-height:1.3;">Smart Search</div>
                      <div style="font-size:10px; line-height:1.45; color:#6b7280;">Find your dream car with advanced filters &amp; history.</div>
                    </td>
                  </tr>
                </table>
              </td>
              <td style="width:50%; padding-left:6px; vertical-align:top;">
                <table role="presentation" style="border-collapse:collapse;">
                  <tr>
                    <td style="width:22px; vertical-align:top; padding-top:2px; color:#10b981; font-size:14px; line-height:1;">&#9889;</td>
                    <td style="padding-left:6px;">
                      <div style="font-size:10px; font-weight:700; color:#1f2937; line-height:1.3;">Instant Offers</div>
                      <div style="font-size:10px; line-height:1.45; color:#6b7280;">Get real-time valuations for your current vehicle.</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:0; font-size:10px; line-height:1.6; color:#7c8aa0; text-align:center;">
            If you didn&apos;t register for CarTradez, please ignore this email. Your security is our priority.
          </p>
        </div>
        <div style="padding:10px 18px 14px 18px; border-top:1px solid #e5e7eb; text-align:left;">
          <p style="margin:0 0 4px 0; font-size:12px; line-height:1.5; color:#111827;">Regards,</p>
          <p style="margin:0; font-size:12px; line-height:1.5; color:#111827; font-weight:700;">CarTradez Team</p>
        </div>
        <div style="padding:18px 18px 22px 18px; background:#fafbfc; border-top:1px solid #e5e7eb; text-align:center;">
          <p style="margin:0 0 8px 0; font-size:10px; line-height:1.5; color:#7c8aa0;">
            This email was sent from your CarTradez. Please do not reply directly to this automated email address.
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

module.exports = async ({ user, verifyUrl }) => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const html = buildVerifyEmail({
    fullName,
    verifyUrl,
  });

  await sendEmail({
    to: user.email,
    subject: 'Verify Your CarTradez Account',
    html,
  });

  return true;
};
