const emailNotificationProcesses = require('../../email/processes');
const {generateUrl} = require('../../general');

module.exports = async ({user, locale}) => {
  const url = generateUrl({
    path: 'auth/verify-user',
    locale,
    params: user.invitationToken,
  });
  await emailNotificationProcesses.inviteUser({user, url});
};
