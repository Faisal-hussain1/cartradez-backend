const emailNotificationProcesses = require('../../email/processes');
const {generateUrl} = require('../../general');

module.exports = async ({user,locale}) => {
  const verifyUrl = generateUrl({
    path: 'auth/verify',
    locale,
    params: user.verificationToken,
  });
  await emailNotificationProcesses.verifyUser({user, verifyUrl});
};
