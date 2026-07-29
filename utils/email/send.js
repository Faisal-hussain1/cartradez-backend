const nodemailer = require('nodemailer');

const smtpHost = String(process.env.EMAIL_HOST || '').trim();
const smtpPort = Number(process.env.EMAIL_PORT || 587);
const smtpUser = String(process.env.EMAIL_USER || '').trim();
const configuredFromAddress = String(
  process.env.DEFAULT_EMAIL_ADDRESS || ''
).trim();
const fromName = String(
  process.env.DEFAULT_EMAIL_NAME || 'CarTradez'
).trim();
const isSecure = process.env.EMAIL_SECURE
  ? process.env.EMAIL_SECURE === 'true'
  : smtpPort === 465;
const isGmailSmtp = /(^|\.)gmail\.com$/i.test(smtpHost);

// Gmail preserves a different From address only when it is a verified alias.
// Use the authenticated mailbox by default so the header and SMTP envelope align.
const fromAddress =
  isGmailSmtp &&
  smtpUser &&
  configuredFromAddress.toLowerCase() !== smtpUser.toLowerCase() &&
  process.env.EMAIL_ALLOW_FROM_ALIAS !== 'true'
    ? smtpUser
    : configuredFromAddress || smtpUser;

const requiredSettings = {
  EMAIL_HOST: smtpHost,
  EMAIL_USER: smtpUser,
  EMAIL_PASS: process.env.EMAIL_PASS,
  DEFAULT_EMAIL_ADDRESS: fromAddress,
};
const missingSettings = Object.entries(requiredSettings)
  .filter(([, value]) => !value)
  .map(([key]) => key);

let transporter;

const getTransporter = () => {
  if (missingSettings.length) {
    throw new Error(
      `Missing email configuration: ${missingSettings.join(', ')}`
    );
  }

  if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
    throw new Error('EMAIL_PORT must be a valid positive integer');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      requireTLS: !isSecure,
      auth: {
        user: smtpUser,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        minVersion: 'TLSv1.2',
        servername: smtpHost,
      },
    });
  }

  return transporter;
};

const decodeHtmlEntities = value =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const htmlToText = html =>
  decodeHtmlEntities(
    String(html || '')
      .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|tr)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

module.exports = async ({to, subject, html, text, replyTo}) => {
  try {
    const mailOptions = {
      from: {
        name: fromName,
        address: fromAddress,
      },
      to,
      subject,
      html,
      text: text || htmlToText(html),
      replyTo: replyTo || process.env.EMAIL_REPLY_TO || fromAddress,
      envelope: {
        from: fromAddress,
        to,
      },
      disableFileAccess: true,
      disableUrlAccess: true,
    };

    const info = await getTransporter().sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error('Email delivery failed:', error.message);
    throw error;
  }
};
