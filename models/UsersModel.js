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
    // ===== BASIC PROFILE (ALL USERS) =====
    firstName: {
      type: String,
      required: [true, 'User must have a first name'],
    },
    lastName: {
      type: String,
      required: [true, 'User must have a last name'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'User must have a phone number'],
    },
    email: {
      type: String,
      required: [true, 'User must have a email'],
      minlength: 4,
      maxlength: 255,
    },
    termsAccepted:{
      type:Boolean,
      default:false
    },
    privacyAccepted:{
      type:Boolean,
      default:false
    },
    profileImage:{
      type:String,
      default:null
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minlength: 8,
      maxlength: 2048,
      select: false,
    },

    // 🔴 ===== SYSTEM ROLE (NEW) =====
    systemRole: {
      type: String,
      enum: {
        values: usersConstants.SYSTEM_ROLES_VALUES,
        message: 'Invalid system role',
      },
      default: usersConstants.SYSTEM_ROLES.user.value,
    },

    // 🔴 ===== DEALER EXTRA FIELDS (OPTIONAL) =====
    showroomName: {type: String, default: null},
    dealerStatus: {
      type: String,
      enum: {
        values: usersConstants.DEALER_STATUS_VALUES,
        message: 'Invalid dealer status',
      },
      default: usersConstants.DEALER_STATUS.pending.value,
    },
    nrcNo:{
      type:String,
      default:null
    },
    experience:{
      type:Number,
      default:0
    },
    carTypes:{
      type:String,
      enum:['new','used','both'],
      default:'both'
    },
    showroomAddress:{
      type:String,
      default:null,
    },
    ntnNo:{
      type:String,
      default:null
    },
    socialMedia:{
      type:String,
      default:null,
    },
    creditsLeft:{
      type:Number,
      default:0
    },
    // 🔴 ===== LOCATION (OPTIONAL FOR ALL) =====
    country: {type: String, default: null,},
    state: {type: String, default: null},
    city: {type: String,required:true},
    address: {type: String,required:true},

    // 🔴 ===== ADMIN CONTROL =====
    isBlocked: {type: Boolean, default: false},
    blockedAt: {type: Date, default: null},
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      default: null,
    },

    // ===== EXISTING ORGANIZATION & PERMISSIONS =====
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

    // ===== TOKENS =====
    isVerified: {type: Boolean, default: false},
    verificationToken: {type: String},
    loginResetToken: {type: String},

    deletedAt: {type: Date, default: null},
  },
  {
    timestamps: true,
    id: false,
    versionKey: false,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);

// plugins
usersSchema.plugin(hideTimestampsPlugin);
usersSchema.plugin(softDeleteWithIndexesPlugin, {
  uniqueFields: ['email'],
});

// virtual
usersSchema.virtual('currentActiveOrganization').get(function () {
  return this?.organizations?.find((org) => org.isActive) || null;
});

// password hashing
usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await passwordsUtils.saltHashPassword({
    password: this.password,
  });
  next();
});

// methods
usersSchema.methods.generateResetToken = function () {
  const payload = {email: this.email};
  const expiry = generalConstant.passwordResetTokenExpiry;
  const resetToken = jwtUtils.generateToken({payload, expiry});
  this.loginResetToken = resetToken;
  return resetToken;
};

usersSchema.methods.generateVerificationToken = function () {
  const payload = {_id: this._id, email: this.email};
  const expiry = generalConstant.accountVerificationTokenExpiry;
  const verificationToken = jwtUtils.generateToken({payload, expiry});
  this.verificationToken = verificationToken;
  return verificationToken;
};

module.exports = mongoose.model('Users', usersSchema);
