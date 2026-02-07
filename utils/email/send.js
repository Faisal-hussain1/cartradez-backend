// const config = require('config');

// const sgMail = require('@sendgrid/mail');

// const {logger} = require('../../middleware');

// sgMail.setApiKey(config.get('sendGridApiKey'));

// module.exports = async ({
//   to,
//   from,
//   templateId,
//   dynamic_template_data,
//   attachments = [],
// }) => {
//   //  This will be uncommented in the case of having auto reminders to prevent wasting balances on unncessary emails
//   //  Currently we don't send auto emails, so sending emails is necessary for testing and development purposes
//   // if (config.get('env') !== config.get('envVariables.prod')) return;

//   const msg = {to, from, templateId, dynamic_template_data};

//   if (attachments.length > 0) {
//     msg.attachments = attachments;
//   }

//   try {
//     await sgMail.send(msg);
//   } catch (error) {
//     if (error.response) logger.error(error.response);
//   }
// };




const config = require('config');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.get('sendGridApiKey'));

module.exports = async ({
  to,
  from,
  templateId,
  dynamic_template_data,
  attachments = [],
}) => {
  const msg = {
    to,
    from,
    templateId,
    dynamic_template_data,
  };

  if (attachments.length > 0) {
    msg.attachments = attachments;
  }

  try {
    console.log('📨 SENDGRID PAYLOAD:', msg);

    const response = await sgMail.send(msg);

    console.log('✅ SENDGRID SUCCESS:', response);

    return response;
  } catch (error) {
    console.log('❌ SENDGRID ERROR:', error);

    if (error.response) {
      console.log('❌ SENDGRID BODY:', error.response.body);
    }

    throw error;
  }
};
