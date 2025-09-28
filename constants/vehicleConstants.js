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

const VEHICLE_MAKES = {
  alfaRomeo: {
    value: 'alfaRomeo',
    label: 'Alfa Romeo',
  },
  astonMartin: {
    value: 'astonMartin',
    label: 'Aston Martin',
  },
  audi: {
    value: 'audi',
    label: 'Audi',
  },
  austin: {
    value: 'austin',
    label: 'Austin',
  },
  bentley: {
    value: 'bentley',
    label: 'Bentley',
  },
  bmw: {
    value: 'bmw',
    label: 'BMW',
  },
  buick: {
    value: 'buick',
    label: 'Buick',
  },
  byd: {
    value: 'byd',
    label: 'BYD',
  },
  cadillac: {
    value: 'cadillac',
    label: 'Cadillac',
  },
  chery: {
    value: 'chery',
    label: 'Chery',
  },
  chevrolet: {
    value: 'chevrolet',
    label: 'Chevrolet',
  },
  dsAutomobiles: {
    value: 'dsAutomobiles',
    label: 'DS Automobiles',
  },
  ferrari: {
    value: 'ferrari',
    label: 'Ferrari',
  },
  fiat: {
    value: 'fiat',
    label: 'Fiat',
  },
  ford: {
    value: 'ford',
    label: 'Ford',
  },
  foton: {
    value: 'foton',
    label: 'Foton',
  },
  geely: {
    value: 'geely',
    label: 'Geely',
  },
  genesis: {
    value: 'genesis',
    label: 'Genesis',
  },
  gmc: {
    value: 'gmc',
    label: 'GMC',
  },
  gwm: {
    value: 'gwm',
    label: 'GWM',
  },
  haval: {
    value: 'haval',
    label: 'HAVAL',
  },
  holden: {
    value: 'holden',
    label: 'Holden',
  },
  honda: {
    value: 'honda',
    label: 'Honda',
  },
  hummer: {
    value: 'hummer',
    label: 'Hummer',
  },
  hyundai: {
    value: 'hyundai',
    label: 'Hyundai',
  },
  ineos: {
    value: 'ineos',
    label: 'INEOS',
  },
  infinit: {
    value: 'infinit',
    label: 'INFINIT',
  },
  isuzu: {
    value: 'isuzu',
    label: 'ISUZU',
  },
  iveco: {
    value: 'iveco',
    label: 'Iveco',
  },
  jac: {
    value: 'jac',
    label: 'JAC',
  },
  jaecoo: {
    value: 'jaecoo',
    label: 'JAECOO',
  },
  jaguar: {
    value: 'jaguar',
    label: 'Jaguar',
  },
  jeep: {
    value: 'jeep',
    label: 'Jeep',
  },
  kgm: {
    value: 'kgm',
    label: 'KGM',
  },
  kia: {
    value: 'kia',
    label: 'Kia',
  },
  lamborghini: {
    value: 'lamborghini',
    label: 'Lamborghini',
  },
  lancia: {
    value: 'lancia',
    label: 'Lancia',
  },
  landRover: {
    value: 'landRover',
    label: 'Land Rover',
  },
  ldv: {
    value: 'ldv',
    label: 'LDV',
  },
  leapMotor: {
    value: 'leapMotor',
    label: 'Leap motor',
  },
  lexus: {
    value: 'lexus',
    label: 'Lexus',
  },
  lotus: {
    value: 'lotus',
    label: 'Lotus',
  },
  mahindra: {
    value: 'mahindra',
    label: 'Mahindra',
  },
  maserati: {
    value: 'maserati',
    label: 'Maserati',
  },
  mazda: {
    value: 'mazda',
    label: 'Mazda',
  },
  mclaren: {
    value: 'mclaren',
    label: 'McLaren',
  },
  mercedesBenz: {
    value: 'mercedesBenz',
    label: 'Mercedes-Benz',
  },
  mg: {
    value: 'mg',
    label: 'MG',
  },
  mini: {
    value: 'mini',
    label: 'MINI',
  },
  mitsubishi: {
    value: 'mitsubishi',
    label: 'Mitsubishi',
  },
  morgan: {
    value: 'morgan',
    label: 'Morgan',
  },
  morris: {
    value: 'morris',
    label: 'Morris',
  },
  nissan: {
    value: 'nissan',
    label: 'Nissan',
  },
  omoda: {
    value: 'omoda',
    label: 'OMODA',
  },
  opel: {
    value: 'opel',
    label: 'Opel',
  },
  peugeot: {
    value: 'peugeot',
    label: 'Peugeot',
  },
  polestar: {
    value: 'polestar',
    label: 'Polestar',
  },
  pontiac: {
    value: 'pontiac',
    label: 'Pontiac',
  },
  porshe: {
    value: 'porshe',
    label: 'Porshe',
  },
  ram: {
    value: 'ram',
    label: 'Ram',
  },
  renault: {
    value: 'renault',
    label: 'Renault',
  },
  riley: {
    value: 'riley',
    label: 'Riley',
  },
  rollsRoyce: {
    value: 'rollsRoyce',
    label: 'Rolls-Royce',
  },
  rover: {
    value: 'rover',
    label: 'Rover',
  },
  saab: {
    value: 'saab',
    label: 'Saab',
  },
  seat: {
    value: 'seat',
    label: 'SEAT',
  },
  skoda: {
    value: 'skoda',
    label: 'Skoda',
  },
  smart: {
    value: 'smart',
    label: 'Smart',
  },
  ssangYong: {
    value: 'ssangYong',
    label: 'SsangYong',
  },
  studebaker: {
    value: 'studebaker',
    label: 'Studebaker',
  },
  subaru: {
    value: 'subaru',
    label: 'Subaru',
  },
  suzuki: {
    value: 'suzuki',
    label: 'Suzuki',
  },
  tesla: {
    value: 'tesla',
    label: 'Tesla',
  },
  toyota: {
    value: 'toyota',
    label: 'Toyota',
  },
  triumph: {
    value: 'triumph',
    label: 'Triumph',
  },
};

const VEHICLE_MAKES_VALUES = Object.values(VEHICLE_MAKES).map(
  (make) => make.value
);

const VEHICLE_MODELS = {
  allex: {
    value: 'allex',
    label: 'Allex',
  },
  allion: {
    value: 'allion',
    label: 'Allion',
  },
  alphard: {
    value: 'alphard',
    label: 'Alphard',
  },
  altezza: {
    value: 'altezza',
    label: 'Altezza',
  },
  altise: {
    value: 'altise',
    label: 'Altise',
  },
  aqua: {
    value: 'aqua',
    label: 'Aqua',
  },
};

const VEHICLE_MODELS_VALUES = Object.values(VEHICLE_MODELS).map(
  (model) => model.value
);

const VEHICLE_BODIES = {
  convertible: {
    value: 'convertible',
    label: 'Convertible',
  },
  coupe: {
    value: 'coupe',
    label: 'Coupe',
  },
  hatchback: {
    value: 'hatchback',
    label: 'Hatchback',
  },
  sedan: {
    value: 'sedan',
    label: 'Sedan',
  },
  rvOrSuv: {
    value: 'rvOrSuv',
    label: 'RV/SUV',
  },
  other: {
    value: 'other',
    label: 'Other',
  },
};

const VEHICLE_BODIES_VALUES = Object.values(VEHICLE_BODIES).map(
  (body) => body.value
);

const VEHICLE_DOORS = {
  fiveDoor: {
    value: 'fiveDoor',
    label: '5',
  },
  fourDoor: {
    value: 'fourDoor',
    label: '4',
  },
  twoDoor: {
    value: 'twoDoor',
    label: '2',
  },
};

const VEHICLE_DOORS_VALUES = Object.values(VEHICLE_DOORS).map(
  (door) => door.value
);

const VEHICLE_CYLINDERS = {
  dontKnow: {
    value: 'dontKnow',
    label: "Don't know",
  },
  rotatory: {
    value: 'rotatory',
    label: 'Rotatory',
  },
  cylinderFour: {
    value: 'cylinderFour',
    label: '4-cylinder',
  },
  cylinderFive: {
    value: 'cylinderFive',
    label: '5-cylinder',
  },
};

const VEHICLE_CYLINDERS_VALUES = Object.values(VEHICLE_CYLINDERS).map(
  (cylinder) => cylinder.value
);

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
  VEHICLE_MAKES,
  VEHICLE_MAKES_VALUES,
  VEHICLE_MODELS,
  VEHICLE_MODELS_VALUES,
  VEHICLE_BODIES,
  VEHICLE_BODIES_VALUES,
  VEHICLE_DOORS,
  VEHICLE_DOORS_VALUES,
  VEHICLE_CYLINDERS,
  VEHICLE_CYLINDERS_VALUES,
};
