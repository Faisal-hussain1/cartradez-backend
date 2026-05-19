const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT), // ✅ FIX
  secure: process.env.EMAIL_SECURE === 'true', // ✅ FIX
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async ({to, subject, html}) => {
  try {
    const mailOptions = {
      from: `"${process.env.DEFAULT_EMAIL_NAME}" <${process.env.DEFAULT_EMAIL_ADDRESS}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return {success: true};
  } catch (error) {
    console.log('❌ EMAIL ERROR:', error.message);

    throw error; // ❗ throw karo taake controller catch kare
  }
};
