const mongoose = require('mongoose');

const {softDeleteWithIndexesPlugin, showFieldsPlugin} = require('./plugins');

const {Schema} = mongoose;

const userAccessLevelSchema = new Schema(
  {
    view: {
      type: [String],
      default: [],
    },
    update: {
      type: [String],
      default: [],
    },
  },
  {_id: false}
);

const vehiclesAccessLevelSchema = new Schema(
  {
    view: {
      type: [String],
      default: [],
    },
    update: {
      type: [String],
      default: [],
    },
  },
  {_id: false}
);

const levelsSchema = new Schema(
  {
    users: userAccessLevelSchema,
    VEHICLE_ACTIONS_VALUESs: vehiclesAccessLevelSchema,

    // You can add more modules/resources here
    // e.g. companies: companyAccessLevelSchema,
  },
  {_id: false}
);

const permissionsSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organizations',
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Users',
    },
    levels: levelsSchema,
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    id: false,
    versionKey: false,
  }
);

permissionsSchema.plugin(softDeleteWithIndexesPlugin);

permissionsSchema.plugin(showFieldsPlugin, {
  fieldsToShow: ['organizationId', 'userId', 'levels'], // only these will be shown by default
});

module.exports = mongoose.model('Permissions', permissionsSchema);
