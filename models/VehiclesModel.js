const mongoose = require('mongoose');

const {hideTimestampsPlugin} = require('./plugins');

const {
  VEHICLE_FUEL_TYPES_VALUES,
  VEHICLE_CURRENCY_TYPES,
  VEHICLE_TRANSMISSION_TYPES_VALUES,
  VEHICLE_STATUSES_VALUES,
  VEHICLE_STATUSES,
  VEHICLE_CATEGORIES,
  VEHICLE_MAKES_VALUES,
  VEHICLE_CURRENCY_TYPES_VALUES,
  VEHICLE_CATEGORIES_VALUES,
  VEHICLE_ACTIONS_VALUES,
  VEHICLE_CONDITIONS_VALUES,
  VEHICLE_DRIVE_VALUES,
  VEHICLE_LISTINGS_VALUES,
  VEHICLE_LISTINGS,
  VEHICLE_BODIES_VALUES,
} = require('../constants/vehicleConstants');

const Schema = mongoose.Schema;

const vehiclesSchema = new Schema(
  {
    make: {type: String, required: true, enum: VEHICLE_MAKES_VALUES},
    model: {type: String, required: true},
    variant: {type: String},
    year: {type: Number, required: true},
    condition: {type: String, required: true, enum: VEHICLE_CONDITIONS_VALUES},
    bodyType: {type: String, required: true, enum: VEHICLE_BODIES_VALUES},
    color: {type: String, required: true},
    mileage: {type: Number, required: true},
    engineSize: {
      type: Number,
      required: true,
    },
    transmission: {
      type: String,
      enum: VEHICLE_TRANSMISSION_TYPES_VALUES,
      required: true,
    },
    fuelType: {
      type: String,
      enum: VEHICLE_FUEL_TYPES_VALUES,
      required: true,
    },
    driveType: {type: String, required: true, enum: VEHICLE_DRIVE_VALUES},
    currency: {
      type: String,
      required: true,
      enum: VEHICLE_CURRENCY_TYPES_VALUES,
      default: VEHICLE_CURRENCY_TYPES.usd.value,
    },
    price: {type: Number, required: true},
    registrationCity: {type: String, required: true},
    registrationYear: {type: Number, required: true},
    registrationNumber: {type: String, required: true},
    numberOfOwners: {type: Number, required: true},
    features: [{type: String}],
    description: {type: String, required: true},
    images: [
      {
        key: {type: String,},
        url: {type: String,},
      },
    ],
    coverImage: {
      key: {type: String},
      url: {type: String},
    },

    category: {
      type: String,
      required: true,
      enum: VEHICLE_CATEGORIES_VALUES,
      default: VEHICLE_CATEGORIES.car.value,
    },
    creatorId: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
    listingType: {
      type: String,
      enum: VEHICLE_LISTINGS_VALUES,
      default: VEHICLE_LISTINGS.standard.value,
    },
    isManagedByCartradez: {type: Boolean, default: false},
    status: {
      type: String,
      enum: VEHICLE_STATUSES_VALUES,
      default: VEHICLE_STATUSES.active.value,
    },
    events: [
      {
        action: {
          type: String,
          enum: VEHICLE_ACTIONS_VALUES,
          required: true,
        },
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'Users',
          required: true,
        },
        timestamp: {
          type: Number,
          required: true,
        },
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },

    // body: {type: String, required: true, enum: VEHICLE_BODIES_VALUES},
    // seats: {type: Number},
    // doors: {type: String, enum: VEHICLE_DOORS_VALUES},
    // numberPlate: {
    //   type: String,
    //   required: true,
    // },
    // cylinder: {
    //   type: String,
    //   enum: VEHICLE_CYLINDERS_VALUES,
    // },
    // modelDetail: {
    //   type: String,
    // },
    // importHistory: {
    //   type: String,
    // },
    // location: {type: String},
  },
  {
    timestamps: true,
    id: false,
    versionKey: false,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);

// Use the hide timestamps plugin
vehiclesSchema.plugin(hideTimestampsPlugin);

module.exports = mongoose.model('Vehicles', vehiclesSchema);
