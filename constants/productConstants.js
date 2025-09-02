const PRODUCT_CATEGORIES = {
  car: {value: 'car'},
};

const PRODUCT_CATEGORIES_VALUES = Object.values(PRODUCT_CATEGORIES).map(
  (role) => role.value
);

const PRODUCT_CONDITIONS = {
  new: {value: 'new'},
  used: {value: 'used'},
};

const PRODUCT_CONDITIONS_VALUES = Object.values(PRODUCT_CONDITIONS).map(
  (role) => role.value
);

const PRODUCT_FUEL_TYPES = {
  petrol: {value: 'petrol'},
  diesel: {value: 'diesel'},
  electric: {value: 'electric'},
  hybrid: {value: 'hybrid'},
};

const PRODUCT_FUEL_TYPES_VALUES = Object.values(PRODUCT_FUEL_TYPES).map(
  (role) => role.value
);

const PRODUCT_CURRENCY_TYPES = {
  usd: {value: 'usd', symbol: '$'},
};

const PRODUCT_CURRENCY_TYPES_VALUES = Object.values(PRODUCT_CURRENCY_TYPES).map(
  (role) => role.value
);

const PRODUCT_TRANSMISSION_TYPES = {
  manual: {value: 'manual'},
  automatic: {value: 'automatic'},
};

const PRODUCT_TRANSMISSION_TYPES_VALUES = Object.values(
  PRODUCT_TRANSMISSION_TYPES
).map((role) => role.value);

const PRODUCT_STATUSES = {
  pending: {value: 'pending'},
  active: {value: 'active'},
  sold: {value: 'sold'},
};

const PRODUCT_STATUSES_VALUES = Object.values(PRODUCT_STATUSES).map(
  (role) => role.value
);

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

module.exports = {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORIES_VALUES,
  PRODUCT_CONDITIONS,
  PRODUCT_CONDITIONS_VALUES,
  PRODUCT_FUEL_TYPES,
  PRODUCT_FUEL_TYPES_VALUES,
  PRODUCT_CURRENCY_TYPES,
  PRODUCT_CURRENCY_TYPES_VALUES,
  PRODUCT_TRANSMISSION_TYPES,
  PRODUCT_TRANSMISSION_TYPES_VALUES,
  PRODUCT_STATUSES,
  PRODUCT_STATUSES_VALUES,
  ALLOWED_FILE_TYPES,
};
