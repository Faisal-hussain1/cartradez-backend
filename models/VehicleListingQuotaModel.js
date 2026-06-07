const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const vehicleListingQuotaSchema = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    listingType: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    used: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

vehicleListingQuotaSchema.index(
  {creatorId: 1, listingType: 1, period: 1},
  {unique: true}
);

module.exports = mongoose.model('VehicleListingQuotas', vehicleListingQuotaSchema);
