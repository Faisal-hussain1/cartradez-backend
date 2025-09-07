const mongoose = require('mongoose');

const {hideTimestampsPlugin} = require('./plugins');
const {PRODUCT_CATEGORIES_VALUES} = require('../constants/productConstants');

const Schema = mongoose.Schema;

const productCategoriesSchema = new Schema(
  {
    name: {
      type: String,
      enum: PRODUCT_CATEGORIES_VALUES,
      required: [true, 'Category name is required'],
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
productCategoriesSchema.plugin(hideTimestampsPlugin);

module.exports = mongoose.model('ProductCategories', productCategoriesSchema);
