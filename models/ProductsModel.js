const mongoose = require('mongoose');

const {hideTimestampsPlugin} = require('./plugins');

const {
  PRODUCT_CONDITIONS_VALUES,
  PRODUCT_CONDITIONS,
  PRODUCT_FUEL_TYPES_VALUES,
  PRODUCT_CURRENCY_TYPES,
  PRODUCT_TRANSMISSION_TYPES_VALUES,
  PRODUCT_STATUSES_VALUES,
  PRODUCT_STATUSES,
} = require('../constants/productConstants');

const Schema = mongoose.Schema;

const productsSchema = new Schema(
  {
    title: {type: String, required: true},
    description: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductCategories',
      required: true,
    },
    price: {type: Number, required: true},
    currency: {type: String, default: PRODUCT_CURRENCY_TYPES.usd.value},
    images: [
      {
        key: {type: String, required: true},
        url: {type: String, required: true},
      },
    ],

    // isVerified: {type: Boolean, default: true},
    condition: {
      type: String,
      enum: PRODUCT_CONDITIONS_VALUES,
      default: PRODUCT_CONDITIONS.used.value,
    },
    location: {type: String, required: true},
    sellerId: {type: Schema.Types.ObjectId, ref: 'Users', required: true},

    brand: {type: String, required: true},
    model: {type: String, required: true},
    year: {type: Number, required: true},
    mileage: {type: Number, required: true},
    fuelType: {
      type: String,
      enum: PRODUCT_FUEL_TYPES_VALUES,
      required: true,
    },
    transmission: {
      type: String,
      required: true,
      enum: PRODUCT_TRANSMISSION_TYPES_VALUES,
    },
    engineCapacity: {type: Number},
    color: {type: String, required: true},

    isFeatured: {type: Boolean, default: false},
    status: {
      type: String,
      enum: PRODUCT_STATUSES_VALUES,
      default: PRODUCT_STATUSES.active.value,
    },

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
productsSchema.plugin(hideTimestampsPlugin);

module.exports = mongoose.model('Products', productsSchema);
