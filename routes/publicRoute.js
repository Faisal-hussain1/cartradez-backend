const express = require('express');
const config = require('config');

const {accessMiddleware} = require('../middleware');
const sendEmail = require('../utils/email/send');
const {generateUrl} = require('../utils/general');

const escapeHtml = value =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMultiline = value => escapeHtml(value).replace(/\n/g, '<br/>');

const buildContactEmail = ({name, email, phone, message}) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || 'N/A');
  const safeMessage = formatMultiline(message);
  const currentYear = new Date().getFullYear();
  const logoUrl =
    process.env.EMAIL_LOGO_URL ||
    'https://www.cartradez.com/images/logo-black.png';
  const replySubject = encodeURIComponent(
    `Re: New Contact Message from ${name}`
  );
  const replyHref = `mailto:${safeEmail}?subject=${replySubject}`;
  const dashboardHref = generateUrl({
    path: 'dashboard',
    locale: config.get('locale'),
  });

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
                  &#128172;
                </div>
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:18px; font-weight:700; line-height:1.2; color:#1f2a44;">
                  New Contact Message
                </div>
                <div style="font-size:10px; line-height:1.4; color:#6b7280;">
                  You have received a new inquiry.
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding:14px 18px 10px 18px;">
          <div style="font-size:10px; font-weight:700; letter-spacing:0.04em; color:#374151; text-transform:uppercase; margin:0 0 10px 0;">
            Customer Details
          </div>
          <div style="border:1px solid #d9e2ef; border-radius:10px; background:#f8fbff; padding:12px 12px 10px 12px; margin:0 0 14px 0;">
            <table role="presentation" style="border-collapse:collapse; width:100%;">
              <tr>
                <td style="width:22px; vertical-align:top; padding-top:2px; color:#94a3b8; font-size:14px; line-height:1;">&#128100;</td>
                <td style="padding:0 0 10px 0;">
                  <div style="font-size:10px; color:#6b7280; line-height:1.2;">Full Name</div>
                  <div style="font-size:13px; font-weight:700; color:#111827; line-height:1.4;">${safeName}</div>
                </td>
              </tr>
              <tr>
                <td style="width:22px; vertical-align:top; padding-top:2px; color:#94a3b8; font-size:14px; line-height:1;">&#9993;</td>
                <td style="padding:0 0 10px 0;">
                  <div style="font-size:10px; color:#6b7280; line-height:1.2;">Email Address</div>
                  <div style="font-size:13px; font-weight:700; line-height:1.4;">
                    <a href="mailto:${safeEmail}" style="color:#2563eb; text-decoration:underline;">${safeEmail}</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="width:22px; vertical-align:top; padding-top:2px; color:#94a3b8; font-size:14px; line-height:1;">&#128222;</td>
                <td>
                  <div style="font-size:10px; color:#6b7280; line-height:1.2;">Phone Number</div>
                  <div style="font-size:13px; font-weight:700; color:#111827; line-height:1.4;">${safePhone}</div>
                </td>
              </tr>
            </table>
          </div>
          <div style="font-size:10px; font-weight:700; letter-spacing:0.04em; color:#374151; text-transform:uppercase; margin:0 0 10px 0;">
            Message Content
          </div>
          <div style="border:1px solid #d9e2ef; border-radius:10px; background:#ffffff; padding:12px; margin:0 0 14px 0;">
            <div style="font-size:13px; line-height:1.65; color:#1f2937;">
              ${safeMessage}
            </div>
          </div>
          <table role="presentation" style="border-collapse:collapse; width:100%;">
            <tr>
              <td style="padding-right:8px;">
                <a href="${replyHref}" style="display:block; text-decoration:none; background:#0f4c8a; color:#ffffff; border-radius:6px;">
                  <table role="presentation" style="border-collapse:collapse; width:100%;">
                    <tr>
                      <td style="padding:13px 6px 13px 12px; text-align:center; font-size:12px; font-weight:700; line-height:1; color:#ffffff;">
                        Reply to Customer
                      </td>
                      <td style="width:18px; padding:13px 12px 13px 0; text-align:center; font-size:12px; font-weight:700; line-height:1; color:#ffffff;">
                        &#8594;
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
              <td style="padding-left:8px;">
                <a href="${dashboardHref}" style="display:block; text-decoration:none; background:#e5e7eb; color:#374151; border-radius:6px;">
                  <table role="presentation" style="border-collapse:collapse; width:100%;">
                    <tr>
                      <td style="padding:13px 6px 13px 12px; text-align:center; font-size:12px; font-weight:700; line-height:1; color:#374151;">
                        View in Dashboard
                      </td>
                      <td style="width:18px; padding:13px 12px 13px 0; text-align:center; font-size:11px; font-weight:700; line-height:1; color:#374151;">
                        &#128279;
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
            </tr>
          </table>
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

const router = express.Router();

const sampleAccessCustomFunction = ({req}) => {};

router.post(
  '/sample',
  accessMiddleware({customFn: sampleAccessCustomFunction}),
  (req, res, next) => res.status(200).json({message: 'Public Sample'})
);

router.post('/contact', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const phone = String(req.body?.phone || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.',
      });
    }

    const recipient =
      process.env.CONTACT_RECEIVER_EMAIL;

    if (!recipient) {
      return res.status(500).json({
        success: false,
        message: 'Contact receiver email is not configured.',
      });
    }

    const html = buildContactEmail({
      name,
      email,
      phone,
      message,
    });

    await sendEmail({
      to: recipient,
      subject: `New Contact Form Message from ${name}`,
      html,
    });

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully.',
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
