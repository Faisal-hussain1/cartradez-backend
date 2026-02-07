const SYSTEM_ROLES = {
  admin: {value: 'admin'},
  manager: {value: 'manager'},
  dealer: {value: 'dealer'},
  user: {value: 'user'},
};

const SYSTEM_ROLES_VALUES = Object.values(SYSTEM_ROLES).map(
  (role) => role.value
);

// ✅ ADDED: Dealer status constants
const DEALER_STATUS = {
  pending: {value: 'pending'},
  approved: {value: 'approved'},
  rejected: {value: 'rejected'},
};

const DEALER_STATUS_VALUES = Object.values(DEALER_STATUS).map((s) => s.value);

const LANGUAGES = {
  english: {value: 'en'},
  dutch: {value: 'nl'},

  // Add more languages as needed
};

const LANGUAGES_VALUES = Object.values(LANGUAGES).map(
  (language) => language.value
);

const DEFAULT_LANGUAGE = LANGUAGES.english.value;

module.exports = {
  SYSTEM_ROLES,
  SYSTEM_ROLES_VALUES,

  DEALER_STATUS,
  DEALER_STATUS_VALUES,

  LANGUAGES,
  LANGUAGES_VALUES,
  DEFAULT_LANGUAGE,
};
