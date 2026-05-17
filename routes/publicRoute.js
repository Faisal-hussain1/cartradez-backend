const express = require('express');

const {accessMiddleware} = require('../middleware');
const sendEmail = require('../utils/email/send');

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

    const escapedMessage = message.replace(/\n/g, '<br/>');

    await sendEmail({
      to: recipient,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${escapedMessage}</p>
      `,
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
