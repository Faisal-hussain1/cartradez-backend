const VEHICLE_CATEGORIES = {
  car: {value: 'car'},
};

const VEHICLE_CATEGORIES_VALUES = Object.values(VEHICLE_CATEGORIES).map(
  (role) => role.value
);

const VEHICLE_CONDITIONS = {
  new: {value: 'new'},
  used: {value: 'used'},
};

const VEHICLE_CONDITIONS_VALUES = Object.values(VEHICLE_CONDITIONS).map(
  (role) => role.value
);

const VEHICLE_FUEL_TYPES = {
  petrol: {value: 'petrol'},
  diesel: {value: 'diesel'},
  electric: {value: 'electric'},
  hybrid: {value: 'hybrid'},
};

const VEHICLE_FUEL_TYPES_VALUES = Object.values(VEHICLE_FUEL_TYPES).map(
  (role) => role.value
);

const VEHICLE_CURRENCY_TYPES = {
  usd: {value: 'usd', symbol: '$'},
  zmw: {value: 'zmw', symbol: 'ZMW'},
};

const VEHICLE_CURRENCY_TYPES_VALUES = Object.values(VEHICLE_CURRENCY_TYPES).map(
  (role) => role.value
);

const VEHICLE_TRANSMISSION_TYPES = {
  manual: {value: 'manual'},
  automatic: {value: 'automatic'},
};

const VEHICLE_TRANSMISSION_TYPES_VALUES = Object.values(
  VEHICLE_TRANSMISSION_TYPES
).map((role) => role.value);

const VEHICLE_STATUSES = {
  pending: {value: 'pending'},
  active: {value: 'active'},
  sold: {value: 'sold'},
};

const VEHICLE_STATUSES_VALUES = Object.values(VEHICLE_STATUSES).map(
  (role) => role.value
);

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const VEHICLE_ACTIONS = {
  created: {
    value: 'created',
  },
  bought: {
    value: 'bought',
  },
};

const VEHICLE_ACTIONS_VALUES = Object.values(VEHICLE_ACTIONS).map(
  (action) => action.value
);

const CAR_TYPES = {
  sedan: {
    value: 'sedan',
    label: 'Sedan',
  },
  suv: {
    value: 'suv',
    label: 'SUV',
  },
  hatchback: {
    value: 'hatchback',
    label: 'Hatchback',
  },
  stationWagon: {
    value: 'stationWagon',
    label: 'Station Wagon',
  },
  coach: {
    value: 'coach',
    label: 'Coach',
  },
  pickup: {
    value: 'pickup',
    label: 'Pickup',
  },
  convertible: {
    value: 'convertible',
    label: 'Convertible',
  },
  sportsCar: {
    value: 'sportsCar',
    label: 'Sports Car',
  },
  crossover: {
    value: 'crossover',
    label: 'Crossover',
  },
};

const CAR_TYPES_VALUES = Object.values(CAR_TYPES).map((action) => action.value);

module.exports = {
  VEHICLE_CATEGORIES,
  VEHICLE_CATEGORIES_VALUES,
  VEHICLE_CONDITIONS,
  VEHICLE_CONDITIONS_VALUES,
  VEHICLE_FUEL_TYPES,
  VEHICLE_FUEL_TYPES_VALUES,
  VEHICLE_CURRENCY_TYPES,
  VEHICLE_CURRENCY_TYPES_VALUES,
  VEHICLE_TRANSMISSION_TYPES,
  VEHICLE_TRANSMISSION_TYPES_VALUES,
  VEHICLE_STATUSES,
  VEHICLE_STATUSES_VALUES,
  ALLOWED_FILE_TYPES,
  VEHICLE_ACTIONS,
  VEHICLE_ACTIONS_VALUES,
  CAR_TYPES,
  CAR_TYPES_VALUES,
};
