module.exports = {
  tokenExpirationTime: '1d', // 1 day
  cookieExpirationTime: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  passwordResetTokenExpiry: '1h', // 1 hour
  accountVerificationTokenExpiry: '1h', // 1 hour
  userInvitationTokenExpiry: '1d',

  paginationDefaults: {
    limit: 34,
    page: 1,
  },
};

module.exports.TIME_ZONES = {
  utc: {
    value: 'utc',
  },
};

module.exports.LOCALES = {
  en: {
    value: 'en',
  },
};
