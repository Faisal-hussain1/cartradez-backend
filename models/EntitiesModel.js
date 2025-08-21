const mongoose = require('mongoose');

const {softDeleteWithIndexesPlugin, showFieldsPlugin} = require('./plugins');

const {Schema} = mongoose;

const entitiesSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'It must have a title'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Users',
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organizations',
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
  }
);

entitiesSchema.plugin(softDeleteWithIndexesPlugin);

entitiesSchema.plugin(showFieldsPlugin, {
  fieldsToShow: ['title', 'organizationId', 'userId'], // only these will be shown by default
});

module.exports = mongoose.model('Entities', entitiesSchema);
