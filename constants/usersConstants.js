const SYSTEM_ROLES = {
  admin: {value: 'admin'},
  employee: {value: 'employee'},
};

const SYSTEM_ROLES_VALUES = Object.values(SYSTEM_ROLES).map(
  (role) => role.value
);

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
  LANGUAGES,
  LANGUAGES_VALUES,
  DEFAULT_LANGUAGE,
};
