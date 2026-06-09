const VEHICLE_MAKES = {
  toyota: {value: 'toyota', label: 'Toyota'},
  honda: {value: 'honda', label: 'Honda'},
  bmw: {value: 'bmw', label: 'BMW'},
  mercedes: {value: 'mercedes', label: 'Mercedes-Benz'},
  audi: {value: 'audi', label: 'Audi'},
  hyundai: {value: 'hyundai', label: 'Hyundai'},
  kia: {value: 'kia', label: 'Kia'},
  nissan: {value: 'nissan', label: 'Nissan'},
  suzuki: {value: 'suzuki', label: 'Suzuki'},
  chevrolet: {value: 'chevrolet', label: 'Chevrolet'},
  ford: {value: 'ford', label: 'Ford'},
  volkswagen: {value: 'volkswagen', label: 'Volkswagen'},
  mitsubishi: {value: 'mitsubishi', label: 'Mitsubishi'},
  mazda: {value: 'mazda', label: 'Mazda'},
  hino: {value: 'hino', label: 'Hino'},
  isuzu: {value: 'isuzu', label: 'Isuzu'},
  daewoo: {value: 'daewoo', label: 'Daewoo'},
  jeep: {value: 'jeep', label: 'Jeep'},
  lexus: {value: 'lexus', label: 'Lexus'},
  tesla: {value: 'tesla', label: 'Tesla'},
  landrover: {value: 'landrover', label: 'Land Rover'},
  rangerover: {value: 'rangerover', label: 'Range Rover'},
  proton: {value: 'proton', label: 'Proton'},
  daihatsu: {value: 'daihatsu', label: 'Daihatsu'},
  subaru: {value: 'subaru', label: 'Subaru'},
  changan: {value: 'changan', label: 'Changan'},
  mg: {value: 'mg', label: 'MG'},
  peugeot: {value: 'peugeot', label: 'Peugeot'},
  fiat: {value: 'fiat', label: 'Fiat'},
};

const VEHICLE_MAKES_VALUES = Object.values(VEHICLE_MAKES).map(
  (make) => make.value
);

const VEHICLE_MODELS = {
  // Toyota
  corolla: {value: 'corolla', label: 'Corolla', make: 'toyota'},
  yaris: {value: 'yaris', label: 'Yaris', make: 'toyota'},
  camry: {value: 'camry', label: 'Camry', make: 'toyota'},
  hilux: {value: 'hilux', label: 'Hilux', make: 'toyota'},
  fortuner: {value: 'fortuner', label: 'Fortuner', make: 'toyota'},
  prado: {value: 'prado', label: 'Prado', make: 'toyota'},

  // Honda
  civic: {value: 'civic', label: 'Civic', make: 'honda'},
  city: {value: 'city', label: 'City', make: 'honda'},
  brv: {value: 'brv', label: 'BR-V', make: 'honda'},
  vezel: {value: 'vezel', label: 'Vezel', make: 'honda'},

  // Suzuki
  mehran: {value: 'mehran', label: 'Mehran', make: 'suzuki'},
  alto: {value: 'alto', label: 'Alto', make: 'suzuki'},
  cultus: {value: 'cultus', label: 'Cultus', make: 'suzuki'},
  wagonr: {value: 'wagonr', label: 'Wagon R', make: 'suzuki'},
  swift: {value: 'swift', label: 'Swift', make: 'suzuki'},
  bolan: {value: 'bolan', label: 'Bolan', make: 'suzuki'},

  // Hyundai
  elantra: {value: 'elantra', label: 'Elantra', make: 'hyundai'},
  sonata: {value: 'sonata', label: 'Sonata', make: 'hyundai'},
  tucson: {value: 'tucson', label: 'Tucson', make: 'hyundai'},

  // Kia
  sportage: {value: 'sportage', label: 'Sportage', make: 'kia'},
  picanto: {value: 'picanto', label: 'Picanto', make: 'kia'},
  stonic: {value: 'stonic', label: 'Stonic', make: 'kia'},

  // Nissan
  sunny: {value: 'sunny', label: 'Sunny', make: 'nissan'},
  note: {value: 'note', label: 'Note', make: 'nissan'},
  patrol: {value: 'patrol', label: 'Patrol', make: 'nissan'},

  // BMW
  x1: {value: 'x1', label: 'BMW X1', make: 'bmw'},
  x5: {value: 'x5', label: 'BMW X5', make: 'bmw'},
  '3series': {value: '3series', label: 'BMW 3 Series', make: 'bmw'},
  '5series': {value: '5series', label: 'BMW 5 Series', make: 'bmw'},

  // Mercedes
  cclass: {value: 'cclass', label: 'C-Class', make: 'mercedes'},
  eclass: {value: 'eclass', label: 'E-Class', make: 'mercedes'},
  sclass: {value: 'sclass', label: 'S-Class', make: 'mercedes'},
  gla: {value: 'gla', label: 'GLA', make: 'mercedes'},

  // Audi
  a3: {value: 'a3', label: 'A3', make: 'audi'},
  a4: {value: 'a4', label: 'A4', make: 'audi'},
  a6: {value: 'a6', label: 'A6', make: 'audi'},
  q7: {value: 'q7', label: 'Q7', make: 'audi'},

  // Mitsubishi
  lancer: {value: 'lancer', label: 'Lancer', make: 'mitsubishi'},
  pajero: {value: 'pajero', label: 'Pajero', make: 'mitsubishi'},
  mirage: {value: 'mirage', label: 'Mirage', make: 'mitsubishi'},
};

const VEHICLE_MODELS_VALUES = Object.values(VEHICLE_MODELS).map(
  (model) => model.value
);

const VEHICLE_VARIANTS = {
  // Toyota Corolla
  corolla_xli: {value: 'corolla_xli', label: 'Corolla XLi', model: 'corolla'},
  corolla_gli: {value: 'corolla_gli', label: 'Corolla GLi', model: 'corolla'},
  corolla_altis: {
    value: 'corolla_altis',
    label: 'Corolla Altis',
    model: 'corolla',
  },
  corolla_altis_grande: {
    value: 'corolla_altis_grande',
    label: 'Corolla Altis Grande',
    model: 'corolla',
  },

  // Honda Civic
  civic_orsiel: {value: 'civic_orsiel', label: 'Civic Oriel', model: 'civic'},
  civic_turbo: {value: 'civic_turbo', label: 'Civic Turbo', model: 'civic'},
  civic_rs: {value: 'civic_rs', label: 'Civic RS', model: 'civic'},

  // Suzuki Alto
  alto_vxr: {value: 'alto_vxr', label: 'Alto VXR', model: 'alto'},
  alto_vxl: {value: 'alto_vxl', label: 'Alto VXL', model: 'alto'},
  alto_vx: {value: 'alto_vx', label: 'Alto VX', model: 'alto'},

  // Suzuki Cultus
  cultus_vxr: {value: 'cultus_vxr', label: 'Cultus VXR', model: 'cultus'},
  cultus_vxl: {value: 'cultus_vxl', label: 'Cultus VXL', model: 'cultus'},
  cultus_ag: {value: 'cultus_ag', label: 'Cultus Auto Gear', model: 'cultus'},

  // Toyota Yaris
  yaris_ativ: {value: 'yaris_ativ', label: 'Yaris ATIV', model: 'yaris'},
  yaris_ativx: {value: 'yaris_ativx', label: 'Yaris ATIV X', model: 'yaris'},
  yaris_glx: {value: 'yaris_glx', label: 'Yaris GLX', model: 'yaris'},

  // Kia Sportage
  sportage_alpha: {
    value: 'sportage_alpha',
    label: 'Sportage Alpha',
    model: 'sportage',
  },
  sportage_fwd: {
    value: 'sportage_fwd',
    label: 'Sportage FWD',
    model: 'sportage',
  },
  sportage_awd: {
    value: 'sportage_awd',
    label: 'Sportage AWD',
    model: 'sportage',
  },

  // Hyundai Tucson
  tucson_fwd: {value: 'tucson_fwd', label: 'Tucson FWD', model: 'tucson'},
  tucson_awd: {value: 'tucson_awd', label: 'Tucson AWD', model: 'tucson'},
  tucson_signature: {
    value: 'tucson_signature',
    label: 'Tucson Signature',
    model: 'tucson',
  },

  // Suzuki Swift
  swift_gl: {value: 'swift_gl', label: 'Swift GL', model: 'swift'},
  swift_glx: {value: 'swift_glx', label: 'Swift GLX', model: 'swift'},

  // Honda City
  city_aspire: {value: 'city_aspire', label: 'City Aspire', model: 'city'},
  city_15: {value: 'city_15', label: 'City 1.5L', model: 'city'},
  city_12: {value: 'city_12', label: 'City 1.2L', model: 'city'},
};

const VEHICLE_VARIANTS_VALUES = Object.values(VEHICLE_VARIANTS).map(
  (variant) => variant.value
);

const VEHICLE_CONDITIONS = {
  imported: {
    value: 'imported',
    label: 'Imported (Unregistered)',
  },
  used: {
    value: 'used',
    label: 'Used',
  },
  new: {
    value: 'new',
    label: 'New',
  },
};

const VEHICLE_CONDITIONS_VALUES = Object.values(VEHICLE_CONDITIONS).map(
  (role) => role.value
);

const VEHICLE_COLORS = {
  white: {value: 'white', label: 'White'},
  black: {value: 'black', label: 'Black'},
  silver: {value: 'silver', label: 'Silver'},
  grey: {value: 'grey', label: 'Grey'},
  blue: {value: 'blue', label: 'Blue'},
  red: {value: 'red', label: 'Red'},
  maroon: {value: 'maroon', label: 'Maroon'},
  green: {value: 'green', label: 'Green'},
  beige: {value: 'beige', label: 'Beige'},
  brown: {value: 'brown', label: 'Brown'},
  gold: {value: 'gold', label: 'Gold'},
  yellow: {value: 'yellow', label: 'Yellow'},
  orange: {value: 'orange', label: 'Orange'},
  purple: {value: 'purple', label: 'Purple'},
  pink: {value: 'pink', label: 'Pink'},
  navy: {value: 'navy', label: 'Navy Blue'},
  skyblue: {value: 'skyblue', label: 'Sky Blue'},
  champagne: {value: 'champagne', label: 'Champagne'},
  bronze: {value: 'bronze', label: 'Bronze'},
  others: {value: 'others', label: 'Other Color'},
};

const VEHICLE_COLORS_VALUES = Object.values(VEHICLE_COLORS).map(
  (role) => role.value
);

const VEHICLE_DRIVE = {
  fwd: {
    value: 'fwd',
    label: 'Front Wheel Drive (FWD)',
    description: 'Power is sent to the front wheels only.',
  },
  rwd: {
    value: 'rwd',
    label: 'Rear Wheel Drive (RWD)',
    description: 'Power is sent to the rear wheels only.',
  },
  awd: {
    value: 'awd',
    label: 'All Wheel Drive (AWD)',
    description: 'Power is automatically distributed to all wheels as needed.',
  },
  '4wd': {
    value: '4wd',
    label: 'Four Wheel Drive (4WD)',
    description:
      'Power can be manually distributed to all four wheels for off-road driving.',
  },
};

const VEHICLE_DRIVE_VALUES = Object.values(VEHICLE_DRIVE).map(
  (driveType) => driveType.value
);

const VEHICLE_CATEGORIES = {
  car: {value: 'car'},
};

const VEHICLE_CATEGORIES_VALUES = Object.values(VEHICLE_CATEGORIES).map(
  (role) => role.value
);

const VEHICLE_FUEL_TYPES = {
  petrol: {value: 'petrol', label: 'Petrol'},
  diesel: {value: 'diesel', label: 'Diesel'},
  cngGas: {value: 'cngGas', label: 'CNG Gas'},
  electric: {value: 'electric', label: 'Electric'},
  hybrid: {value: 'hybrid', label: 'Hybrid'},
  gasoline: {value: 'gasoline', label: 'Gasoline'},
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
  draft:{value:'draft'},
  rejected:{value:'rejected'},
  deleted:{value:'deleted'}
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

// const VEHICLE_BODIES = {
//   convertible: {
//     value: 'convertible',
//     label: 'Convertible',
//   },
//   coupe: {
//     value: 'coupe',
//     label: 'Coupe',
//   },
//   hatchback: {
//     value: 'hatchback',
//     label: 'Hatchback',
//   },
//   sedan: {
//     value: 'sedan',
//     label: 'Sedan',
//   },
//   rvOrSuv: {
//     value: 'rvOrSuv',
//     label: 'RV/SUV',
//   },
//   other: {
//     value: 'other',
//     label: 'Other',
//   },
// };

const VEHICLE_BODIES = {
  convertible: {value: 'convertible', label: 'Convertible'},
  coupe: {value: 'coupe', label: 'Coupe'},
  hatchback: {value: 'hatchback', label: 'Hatchback'},
  sedan: {value: 'sedan', label: 'Sedan'},
  wagon: {value: 'wagon', label: 'Station Wagon'},
  suv: {value: 'suv', label: 'SUV'},
  crossover: {value: 'crossover', label: 'Crossover'},
  compactSuv: {value: 'compactSuv', label: 'Compact SUV'},
  fullSizeSuv: {value: 'fullSizeSuv', label: 'Full-Size SUV'},
  minivan: {value: 'minivan', label: 'Minivan / MPV'},
  van: {value: 'van', label: 'Van / Cargo Van'},
  pickup: {value: 'pickup', label: 'Pickup Truck'},
  chassisCab: {value: 'chassisCab', label: 'Chassis Cab'},
  sportsCar: {value: 'sportsCar', label: 'Sports Car'},
  supercar: {value: 'supercar', label: 'Supercar / Hypercar'},
  grandTourer: {value: 'grandTourer', label: 'Grand Tourer (GT)'},
  muscleCar: {value: 'muscleCar', label: 'Muscle Car'},
  offRoad: {value: 'offRoad', label: 'Off-Road Vehicle'},
  coupeSuv: {value: 'coupeSuv', label: 'Crossover Coupe / Coupe SUV'},
  ute: {value: 'ute', label: 'Ute / Utility Vehicle'},
  microcar: {value: 'microcar', label: 'Microcar / City Car'},
  limousine: {value: 'limousine', label: 'Limousine'},
  hearse: {value: 'hearse', label: 'Hearse'},
  camperVan: {value: 'camperVan', label: 'Camper Van / RV'},
  panelVan: {value: 'panelVan', label: 'Panel Van'},
  other: {value: 'other', label: 'Other'},
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

const VEHICLE_LISTINGS = {
  premium: {
    value: 'premium',
    label: 'Premium',
  },
  quickSell: {
    value: 'quick sell',
    label: 'Quick Sell',
  },
  standard: {
    value: 'standard',
    label: 'Standard',
  },
};

const VEHICLE_LISTINGS_VALUES = Object.values(VEHICLE_LISTINGS).map(
  (listing) => listing.value
);

module.exports = {
  VEHICLE_MAKES,
  VEHICLE_MAKES_VALUES,
  VEHICLE_MODELS,
  VEHICLE_MODELS_VALUES,
  VEHICLE_VARIANTS,
  VEHICLE_VARIANTS_VALUES,
  VEHICLE_CONDITIONS,
  VEHICLE_CONDITIONS_VALUES,
  VEHICLE_COLORS,
  VEHICLE_COLORS_VALUES,
  VEHICLE_DRIVE,
  VEHICLE_DRIVE_VALUES,

  VEHICLE_CATEGORIES,
  VEHICLE_CATEGORIES_VALUES,
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
  VEHICLE_BODIES,
  VEHICLE_BODIES_VALUES,
  VEHICLE_DOORS,
  VEHICLE_DOORS_VALUES,
  VEHICLE_CYLINDERS,
  VEHICLE_CYLINDERS_VALUES,
  VEHICLE_LISTINGS,
  VEHICLE_LISTINGS_VALUES,
};
