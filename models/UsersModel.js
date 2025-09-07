const mongoose = require('mongoose');

const {generalConstant, usersConstants} = require('../constants');
const {jwtUtils, passwordsUtils} = require('../utils');

const {
  softDeleteWithIndexesPlugin,
  hideTimestampsPlugin,
} = require('./plugins');

const Schema = mongoose.Schema;

const usersSchema = new Schema(
  {
    firstName: {type: String, required: [true, 'User must have a first name']},
    lastName: {type: String, required: [true, 'User must have a last name']},
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'User must have a email'],
      minlength: 4,
      maxlength: 255,
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minlength: 8,
      maxlength: 2048,
      select: false,
    },
    organizations: [
      {
        permissions: {type: Schema.Types.ObjectId, ref: 'Permissions'},
        organizationId: {
          type: Schema.Types.ObjectId,
          ref: 'Organizations',
        },
        role: {
          type: String,
          enum: usersConstants.SYSTEM_ROLES_VALUES,
        },
        isActive: {type: Boolean},
      },
    ],

    isVerified: {type: Boolean, default: true},
    verificationToken: {type: String},
    loginResetToken: {type: String},
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
usersSchema.plugin(hideTimestampsPlugin);

// Use the soft delete plugin
usersSchema.plugin(softDeleteWithIndexesPlugin, {
  uniqueFields: ['email'],
});

usersSchema.virtual('currentActiveOrganization').get(function () {
  return this?.organizations?.find((org) => org.isActive) || null;
});

usersSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password
  this.password = await passwordsUtils.saltHashPassword({
    password: this.password,
  });
  next();
});

usersSchema.methods = {
  generateResetToken: function () {
    const payload = {email: this.email};
    const expiry = generalConstant.passwordResetTokenExpiry;
    const resetToken = jwtUtils.generateToken({payload, expiry});

    this.loginResetToken = resetToken;

    return resetToken;
  },
  generateVerificationToken: function () {
    const payload = {_id: this._id, email: this.email};
    const expiry = generalConstant.accountVerificationTokenExpiry;
    const verificationToken = jwtUtils.generateToken({payload, expiry});

    this.verificationToken = verificationToken;

    return verificationToken;
  },
};

module.exports = mongoose.model('Users', usersSchema);
