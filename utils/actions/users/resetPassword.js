const emailNotificationProcesses = require('../../email/processes');

module.exports = async ({user, resetUrl}) => {
  await emailNotificationProcesses.resetPassword({user, resetUrl});
};
