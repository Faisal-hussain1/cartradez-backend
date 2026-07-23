const {SYSTEM_ROLES} = require('./usersConstants');

const LISTING_TYPES = ['premium', 'quick sell', 'standard'];
const LISTING_TYPE_STORAGE_KEYS = {
  premium: 'premium',
  'quick sell': 'quickSell',
  standard: 'standard',
};
const MAX_MONTHLY_LISTING_LIMIT = 100;

const MONTHLY_LISTING_LIMITS = {
  [SYSTEM_ROLES.user.value]: {
    premium: 1,
    'quick sell': 1,
    standard: 1,
  },
  [SYSTEM_ROLES.dealer.value]: {
    premium: 2,
    'quick sell': 3,
    standard: 5,
  },
};

const getOverrideValue = (overrides, listingType) => {
  const storageKey = LISTING_TYPE_STORAGE_KEYS[listingType];
  const value = overrides?.get
    ? overrides.get(storageKey)
    : overrides?.[storageKey];

  return Number.isInteger(value) ? value : null;
};

const getEffectiveListingLimits = (role, overrides) => {
  const defaults = MONTHLY_LISTING_LIMITS[role] || {};

  return Object.fromEntries(
    LISTING_TYPES.map((listingType) => {
      const defaultLimit = defaults[listingType] ?? 0;
      const override = getOverrideValue(overrides, listingType);
      const isValidOverride =
        override !== null &&
        override >= defaultLimit &&
        override <= MAX_MONTHLY_LISTING_LIMIT;

      return [listingType, isValidOverride ? override : defaultLimit];
    })
  );
};

module.exports = {
  LISTING_TYPES,
  LISTING_TYPE_STORAGE_KEYS,
  MAX_MONTHLY_LISTING_LIMIT,
  MONTHLY_LISTING_LIMITS,
  getEffectiveListingLimits,
  getOverrideValue,
};
