const mongoose = require('mongoose');

const {hideTimestampsPlugin} = require('./plugins');

const {
  VEHICLE_CONDITIONS_VALUES,
  VEHICLE_CONDITIONS,
  VEHICLE_FUEL_TYPES_VALUES,
  VEHICLE_CURRENCY_TYPES,
  VEHICLE_TRANSMISSION_TYPES_VALUES,
  VEHICLE_STATUSES_VALUES,
  VEHICLE_STATUSES,
  VEHICLE_ACTIONS_VALUES,
  VEHICLE_CATEGORIES,
  CAR_TYPES_VALUES,
} = require('../constants/vehicleConstants');

const Schema = mongoose.Schema;

const vehiclesSchema = new Schema(
  {
    name: {type: String, required: true, enum: CAR_TYPES_VALUES},
    price: {type: Number, required: true},
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: VEHICLE_CONDITIONS_VALUES,
      default: VEHICLE_CATEGORIES.car.value,
    },
    currency: {
      type: String,
      required: true,
      default: VEHICLE_CURRENCY_TYPES.usd.value,
    },
    condition: {
      type: String,
      enum: VEHICLE_CONDITIONS_VALUES,
      default: VEHICLE_CONDITIONS.used.value,
    },
    location: {type: String, required: true},
    creatorId: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
    brand: {type: String, required: true},
    model: {type: String, required: true},
    year: {type: Number, required: true},
    mileage: {type: Number, required: true},
    fuelType: {
      type: String,
      enum: VEHICLE_FUEL_TYPES_VALUES,
      required: true,
    },
    transmission: {
      type: String,
      required: true,
      enum: VEHICLE_TRANSMISSION_TYPES_VALUES,
    },
    engineCapacity: {type: Number},
    color: {type: String, required: true},
    isFeatured: {type: Boolean, default: false},
    greatPrice: {type: Boolean, default: false},
    status: {
      type: String,
      enum: VEHICLE_STATUSES_VALUES,
      default: VEHICLE_STATUSES.active.value,
    },
    images: [
      {
        key: {type: String, required: true},
        url: {type: String, required: true},
      },
    ],
    timestamp: {
      type: Number,
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
