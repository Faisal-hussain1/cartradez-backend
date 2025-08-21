const mongoose = require('mongoose');

const {
  softDeleteWithIndexesPlugin,
  hashPasswordPlugin,
  showFieldsPlugin,
} = require('./plugins');

const {generalConstant, usersConstants} = require('../constants');
const {jwtUtils} = require('../utils');

const {Schema} = mongoose;

const organizationsSchema = new Schema(
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
  {_id: false}
);

const usersSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'User must have a email'],
      minlength: 4,
      maxlength: 255,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 2048,
    },
    organizations: [
      {
        type: organizationsSchema,
      },
    ],
    role: {
      type: String,
      enum: usersConstants.SYSTEM_ROLES_VALUES,
    },
    language: {
      type: String,
      enum: usersConstants.LANGUAGES_VALUES,
      default: usersConstants.DEFAULT_LANGUAGE,
    },
    isVerified: {type: Boolean, default: false},
    verificationToken: {type: String},
    invitationToken: {type: String},
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

usersSchema.plugin(showFieldsPlugin, {
  fieldsToShow: ['firstName', 'lastName', 'email', 'isVerified', 'language'], // only these will be shown by default
}); // Whenever you need to get the currentActiveOrganization to show, then you just need to make sure that the organizations is included in the include fields options. Organizations are not selected by default, so that affect the currentActiveOrganization and they show or hide together

// Use the soft delete plugin
usersSchema.plugin(softDeleteWithIndexesPlugin, {uniqueFields: ['email']});

// This plugin will hash the password before saving the user
usersSchema.plugin(hashPasswordPlugin);

usersSchema.virtual('currentActiveOrganization').get(function () {
  return this?.organizations?.find((org) => org.isActive) || null;
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
  generateInvitationToken: function () {
    const payload = {_id: this._id, email: this.email};
    const expiry = generalConstant.userInvitationTokenExpiry;

    const invitationToken = jwtUtils.generateToken({
      payload,
      expiry,
    });

    this.invitationToken = invitationToken;

    return invitationToken;
  },
};

module.exports = mongoose.model('Users', usersSchema);
