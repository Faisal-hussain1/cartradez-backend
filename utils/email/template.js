const config = require('config');

const normalizeUrl = url => (url || '').replace(/\/+$/, '');

const configuredFrontendURL = normalizeUrl(config.get('frontendURL'));
const isLocalFrontend =
  configuredFrontendURL.includes('localhost') ||
  configuredFrontendURL.includes('127.0.0.1');

const publicFrontendURL = isLocalFrontend
  ? 'https://www.cartradez.com'
  : configuredFrontendURL;
const dashboardPurple = '#46467f';
const brandBlue = '#2563eb';

const getIconMarkup = iconType => {
  const icons = {
    approved: '&#10003;',
    rejected: '&times;',
    welcome: '@',
    contact: '&#9993;',
    default: '&#9679;',
  };
  const icon = icons[iconType] || icons.default;

  return `
    <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; text-align: center; border-radius: 999px; background-color: #eaf2ff; color: ${brandBlue}; font-size: 26px; font-weight: 700; font-family: Arial, sans-serif;">
      ${icon}
    </div>
  `;
};

const emailTemplate = ({title,bodyContent,ctaText,ctaUrl,iconType}) => {
  const currentYear = new Date().getFullYear();
  const logoUrl =
    process.env.EMAIL_LOGO_URL ||
    `${publicFrontendURL}/images/logo-black.png`;
  const preheaderText =
    process.env.EMAIL_PREHEADER_TEXT ||
    'Important update from CarTradez for your account.';
  const trimmedTitle = (title || '').trim();
  const titleWords = trimmedTitle.split(/\s+/).filter(Boolean);
  const headlineHtml =
    titleWords.length > 1
      ? `${titleWords.slice(0, -1).join(' ')} <span style="color: ${dashboardPurple};">${titleWords[titleWords.length - 1]}</span>`
      : trimmedTitle;

  const ctaBlock =
    ctaText && ctaUrl
      ? `
        <tr>
          <td style="padding: 6px 44px 30px 44px;">
            <a
              href="${ctaUrl}"
              style="display: inline-block; min-width: 220px; text-align: center; background: ${brandBlue}; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 20px; letter-spacing: -0.1px; padding: 17px 24px; border-radius: 8px;"
            >
              ${ctaText}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 44px 28px 44px; font-family: Arial, sans-serif; color: #667085; font-size: 12px; line-height: 1.6;">
            If the button does not work, copy and paste this link:
            <br />
            <a href="${ctaUrl}" style="color: ${brandBlue}; text-decoration: none; word-break: break-all;">${ctaUrl}</a>
          </td>
        </tr>
      `
      : '';

  return `
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
      ${preheaderText}
    </div>
    <div style="margin: 0; padding: 26px 12px; background-color: #f2f4f7;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center">
            <table role="presentation" style="width: 100%; max-width: 640px; background-color: #ffffff; border-radius: 0; overflow: hidden; border-collapse: collapse; border: 1px solid #e5e7eb;">
              <tr>
                <td style="padding: 18px 44px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb;">
                  <img src="${logoUrl}" alt="CarTradez" style="height: 64px; width: auto; display: block;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 34px 44px 8px 44px;">
                  ${getIconMarkup(iconType)}
                </td>
              </tr>
              <tr>
                <td style="padding: 0 44px 18px 44px; border-bottom: 1px solid #e5e7eb;">
                  <h2 style="margin: 0; font-family: Arial, sans-serif; font-size: 42px; font-weight: 800; line-height: 1.15; color: #1e1e1e; letter-spacing: -0.5px;">
                    ${headlineHtml}
                  </h2>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px 44px 26px 44px; font-family: Arial, sans-serif; color: #1f2937; font-size: 16px; line-height: 1.75;">
                  ${bodyContent}
                </td>
              </tr>
              ${ctaBlock}
              <tr>
                <td style="padding: 26px 44px 0 44px; border-top: 1px solid #e5e7eb; font-family: Arial, sans-serif; color: #111827;">
                  <p style="margin: 0 0 6px 0; font-size: 15px; line-height: 1.5;">Best regards,</p>
                  <p style="margin: 0 0 18px 0; font-size: 28px; font-weight: 700; line-height: 1.2; color: ${dashboardPurple};">CarTradez Team</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 22px 44px 30px 44px; border-top: 1px solid #e5e7eb; background-color: #fafafa; font-family: Arial, sans-serif; color: #667085; font-size: 12px; line-height: 1.65;">
                  <p style="margin: 0 0 8px 0;">
                    This is an automated email from CarTradez.
                  </p>
                  <p style="margin: 0 0 8px 0;">
                    Need help? Visit <a href="${publicFrontendURL}/contact" style="color: ${dashboardPurple}; text-decoration: none; font-weight: 600;">CarTradez Support</a>.
                  </p>
                  <p style="margin: 0; color: #98a2b3;">
                    &copy; ${currentYear} CarTradez. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

module.exports = emailTemplate;
