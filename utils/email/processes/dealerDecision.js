const sendEmail = require('../send');
const {generateUrl} = require('../../general');
const {DEFAULT_LANGUAGE} = require('../../../constants/usersConstants');

const darkPurple = '#46467f';
const darkPurpleSoft = '#f3f1fb';

const escapeHtml = value =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildRejectedEmail = ({fullName, reason, actionUrl}) => {
  const safeName = escapeHtml(fullName || 'User');
  const safeReason = escapeHtml(reason || 'No reason provided.');
  const safeActionUrl = escapeHtml(actionUrl || '');

  return `
    <div style="margin:0; padding:24px 10px; background-color:#f4f6f9;">
      <div style="max-width:320px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 12px 30px rgba(15,23,42,0.08); font-family:Arial, sans-serif; color:#1f2937;">
        <div style="padding:22px 24px 14px 24px; text-align:center; border-bottom:1px solid #e5e7eb;">
          <img src="${process.env.EMAIL_LOGO_URL || 'https://www.cartradez.com/images/logo-black.png'}" alt="CarTradez" style="display:block; width:64px; height:auto; margin:0 auto;" />
        </div>
        <div style="padding:16px 18px 14px 18px; border-bottom:1px solid #e5e7eb;">
          <table role="presentation" style="border-collapse:collapse; width:100%;">
            <tr>
              <td style="width:28px; vertical-align:middle;">
                <div style="width:22px; height:22px; border-radius:6px; background:#fff1f1; border:1px solid #f4b7b7; display:block; color:#ef4444; font-size:14px; font-weight:700; line-height:22px; text-align:center;">
                  &times;
                </div>
              </td>
              <td style="vertical-align:middle; font-size:18px; font-weight:700; line-height:1.2; color:#1f2a44;">
                Dealer Request Rejected
              </td>
            </tr>
          </table>
        </div>
        <div style="padding:16px 18px 10px 18px;">
          <p style="margin:0 0 12px 0; font-size:14px; line-height:1.55; font-weight:700; color:#111827;">
            Hello ${safeName},
          </p>
          <p style="margin:0 0 14px 0; font-size:14px; line-height:1.55; color:#344054;">
            Your dealer request on <strong>CarTradez</strong> has been <strong style="color:#ef4444;">rejected</strong>.
          </p>
          <div style="border:1px solid #d8e3f3; border-left:3px solid #ef4444; border-radius:10px; background:#f8fbff; padding:12px 12px 12px 12px; margin:0 0 16px 0;">
            <table role="presentation" style="border-collapse:collapse; margin:0 0 8px 0;">
              <tr>
                <td style="width:18px; vertical-align:middle;">
                  <span style="display:inline-block; width:14px; height:14px; border-radius:999px; border:1px solid #94a3b8; color:#64748b; background:#ffffff; font-size:10px; line-height:14px; text-align:center; font-weight:700;">
                    i
                  </span>
                </td>
                <td style="vertical-align:middle; color:#64748b; font-size:11px; letter-spacing:0.04em; font-weight:700; text-transform:uppercase;">
                  Reason
                </td>
              </tr>
            </table>
            <div style="font-size:13px; line-height:1.6; color:#1f2937;">
              ${safeReason}
            </div>
          </div>
          <p style="margin:0 0 14px 0; font-size:14px; line-height:1.55; color:#344054;">
            You can update your details and submit a new dealer request.
          </p>
          <div style="padding:2px 0 10px 0;">
            <a href="${safeActionUrl}" style="display:inline-flex; align-items:center; gap:8px; background:#0f4c8a; color:#ffffff; text-decoration:none; font-size:13px; font-weight:700; line-height:1; padding:11px 18px; border-radius:4px;">
              Update Details &amp; Resubmit
              <span style="font-size:12px; line-height:1; margin-left:2px;">&#8635;</span>
            </a>
          </div>
        </div>
        <div style="padding:10px 18px 14px 18px; border-top:1px solid #e5e7eb;">
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
            &copy; 2025 CarTradez. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
};

const buildApprovedEmail = ({fullName, actionUrl, currentYear}) => {
  const safeName = escapeHtml(fullName || 'User');
  const safeActionUrl = escapeHtml(actionUrl || '');

  return `
    <div style="margin:0; padding:24px 10px; background-color:#f4f6f9;">
      <div style="max-width:320px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 12px 30px rgba(15,23,42,0.08); font-family:Arial, sans-serif; color:#1f2937;">
        <div style="padding:22px 24px 14px 24px; text-align:center; border-bottom:1px solid #e5e7eb;">
          <img src="${process.env.EMAIL_LOGO_URL || 'https://www.cartradez.com/images/logo-black.png'}" alt="CarTradez" style="display:block; width:64px; height:auto; margin:0 auto;" />
        </div>
        <div style="padding:16px 18px 14px 18px; border-bottom:1px solid #e5e7eb;">
          <table role="presentation" style="border-collapse:collapse; width:100%;">
            <tr>
              <td style="width:28px; vertical-align:middle;">
                <div style="width:22px; height:22px; border-radius:6px; background:${darkPurpleSoft}; border:1px solid #d7d4e9; display:block; color:${darkPurple}; font-size:14px; font-weight:700; line-height:22px; text-align:center;">
                  &#10003;
                </div>
              </td>
              <td style="vertical-align:middle; font-size:18px; font-weight:700; line-height:1.2; color:#1f2a44;">
                Dealer Request Approved
              </td>
            </tr>
          </table>
        </div>
        <div style="padding:16px 18px 12px 18px;">
          <p style="margin:0 0 12px 0; font-size:14px; line-height:1.55; font-weight:700; color:#111827;">
            Hello ${safeName},
          </p>
          <p style="margin:0 0 14px 0; font-size:14px; line-height:1.55; color:#344054;">
            Your dealer request on <strong>CarTradez</strong> has been <strong style="color:${darkPurple};">approved</strong>.
          </p>
          <p style="margin:0 0 18px 0; font-size:14px; line-height:1.55; color:#344054;">
            You can now continue using dealer features.
          </p>
          <div style="border:1px solid #d8e3f3; border-radius:10px; background:#f8fbff; padding:12px 12px 14px 12px; margin:0 0 16px 0;">
            <table role="presentation" style="border-collapse:collapse; margin:0 0 10px 0;">
              <tr>
                <td style="width:18px; vertical-align:middle;">
                  <span style="display:inline-block; width:14px; height:14px; border-radius:999px; border:1px solid ${darkPurple}; color:${darkPurple}; background:#ffffff; font-size:10px; line-height:14px; text-align:center; font-weight:700;">
                    &#10003;
                  </span>
                </td>
                <td style="vertical-align:middle; color:#374151; font-size:11px; letter-spacing:0.04em; font-weight:700; text-transform:uppercase;">
                  Your Dealer Benefits
                </td>
              </tr>
            </table>
            <table role="presentation" style="border-collapse:collapse; width:100%;">
              <tr>
                <td style="width:22px; vertical-align:top; padding-top:3px; color:${darkPurple}; font-size:14px; line-height:1;">
                  &#10003;
                </td>
                <td style="font-size:13px; line-height:1.6; color:#1f2937; padding-bottom:10px;">
                  Post more vehicle listings with priority placement.
                </td>
              </tr>
              <tr>
                <td style="width:22px; vertical-align:top; padding-top:3px; color:${darkPurple}; font-size:14px; line-height:1;">
                  &#9632;
                </td>
                <td style="font-size:13px; line-height:1.6; color:#1f2937;">
                  Access advanced dealer analytics and customer insights.
                </td>
              </tr>
            </table>
            <div style="padding:16px 0 0 0;">
              <a href="${safeActionUrl}" style="display:block; text-align:center; background:${darkPurple}; color:#ffffff; text-decoration:none; font-size:13px; font-weight:700; line-height:1; padding:13px 18px; border-radius:6px;">
                Access Dealer Dashboard
                <span style="margin-left:10px; font-size:14px; line-height:1;">&#8594;</span>
              </a>
            </div>
          </div>
        </div>
        <div style="padding:10px 18px 14px 18px; border-top:1px solid #e5e7eb;">
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

module.exports = async ({user, status, reason}) => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const isApproved = status === 'approved';
  const currentYear = new Date().getFullYear();
  const locale = user.language || DEFAULT_LANGUAGE;
  const approvalUrl =
    user.dealerDashboardUrl ||
    user.dashboardUrl ||
    user.profileUrl ||
    generateUrl({path: 'dashboard', locale});

  const subject = isApproved
    ? 'Your CarTradez Dealer Request Has Been Approved'
    : 'Your CarTradez Dealer Request Has Been Rejected';

  const html = isApproved
    ? buildApprovedEmail({
        fullName,
        actionUrl: approvalUrl,
        currentYear,
      })
    : buildRejectedEmail({
        fullName,
        reason,
        actionUrl: approvalUrl,
      });

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};
