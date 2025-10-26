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
  VEHICLE_VARIANTS_VALUES,
  VEHICLE_CONDITIONS_VALUES,
  VEHICLE_COLORS_VALUES,
  VEHICLE_DRIVE_VALUES,
} = require('../constants/vehicleConstants');

const Schema = mongoose.Schema;

const vehiclesSchema = new Schema(
  {
    make: {type: String, required: true, enum: VEHICLE_MAKES_VALUES},
    model: {type: String, required: true},
    variant: {type: String, enum: VEHICLE_VARIANTS_VALUES},
    year: {type: Number, required: true},
    condition: {type: String, required: true, enum: VEHICLE_CONDITIONS_VALUES},
    color: {type: String, required: true, enum: VEHICLE_COLORS_VALUES},
    driveType: {type: String, required: true, enum: VEHICLE_DRIVE_VALUES},
    mileage: {type: Number, required: true},
    price: {type: Number, required: true},
    currency: {
      type: String,
      required: true,
      enum: VEHICLE_CURRENCY_TYPES_VALUES,
      default: VEHICLE_CURRENCY_TYPES.usd.value,
    },
    description: {type: String, required: true},
    engineSize: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      enum: VEHICLE_FUEL_TYPES_VALUES,
      required: true,
    },
    transmission: {
      type: String,
      enum: VEHICLE_TRANSMISSION_TYPES_VALUES,
      required: true,
    },
    images: [
      {
        key: {type: String, required: true},
        url: {type: String, required: true},
      },
    ],

    category: {
      type: String,
      required: true,
      enum: VEHICLE_CATEGORIES_VALUES,
      default: VEHICLE_CATEGORIES.car.value,
    },
    creatorId: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organizations',
      required: true,
    },
    isFeatured: {type: Boolean, default: false},
    isGreatPrice: {type: Boolean, default: false},
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
