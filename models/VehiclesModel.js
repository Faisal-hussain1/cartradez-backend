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
const { SYSTEM_ROLES_VALUES } = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const vehiclesSchema = new Schema(
  {
    make: {type: String, required: true},
    model: {type: String, required: true},
    variant: {type: String, default:null},
    year: {type: Number, required: true},
    condition: {type: String, default:null},
    bodyType: {type: String, default:null},
    color: {type: String, default:null},
    mileage: {type: Number, default:null},
    engineSize: {
      type: Number,
      default: null,
    },
    transmission: {
      type: String,
      default: null,
    },
    fuelType: {
      type: String,
      default: null,
    },
    driveType: {type: String, default:null},
    currency: {
      type: String,
      required: true,
      enum: VEHICLE_CURRENCY_TYPES_VALUES,
      default: VEHICLE_CURRENCY_TYPES.usd.value,
    },
    price: {type: Number, required: true},
    registrationCity: {type: String, default:null},
    registrationYear: {type: String, default:null},
    registrationNumber: {type: String, default:null},
    numberOfOwners: {type: String, default:null},
    features: [{type: String}],
    description: {type: String, default:null},
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
      default: null,
    },
    isUpgraded:{type:Boolean,default:false},
    
    isManagedByCartradez: {type: Boolean, default: false},
    status: {
      type: String,
      enum: VEHICLE_STATUSES_VALUES,
      default: VEHICLE_STATUSES.draft.value,
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
    publishedAt:{
      type:Date,
      default:null
    },
    view:{
      type:Number,
      default:0
    },
    deletedBy:{
      type:String,
      enum:SYSTEM_ROLES_VALUES,
      default:null,
    },
    deleteReason:{
      type:String,
      default:null,
    },
    rejectionReason:{
      type:String,
      default:null
    },
    soldAt:{
      type:Date,
      default:null
    },
    paymentId:{
      type:String,
      default:null
    }

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

// Query/index optimizations for high-traffic listing endpoints
vehiclesSchema.index({creatorId: 1, createdAt: -1});
vehiclesSchema.index({isManagedByCartradez: 1, createdAt: -1});
vehiclesSchema.index({listingType: 1, createdAt: -1});
vehiclesSchema.index({status: 1, createdAt: -1});

module.exports = mongoose.model('Vehicles', vehiclesSchema);
