const emailNotificationProcesses = require('../../email/processes');

module.exports = async ({user, status, reason}) => {
  return await emailNotificationProcesses.dealerDecision({user, status, reason});
};
