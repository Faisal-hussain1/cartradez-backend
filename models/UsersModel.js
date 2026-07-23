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
      default: null,
    },
    email: {
      type: String,
      required: [true, 'User must have an email'],
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
    isGoogleOAuthUser: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      minlength: 8,
      maxlength: 2048,
      select: false,
      validate: {
        validator: function(value) {
          // Password is required unless user is a Google OAuth user
          return this.isGoogleOAuthUser || value;
        },
        message: 'User must have a password',
      },
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
    tpin:{
      type:String,
      default:null
    },
    experience:{
      type:Number,
      default:0
    },
    carTypes:{
      type:String,
      enum:['new','used','both', null],
      default:'both'
    },
    showroomAddress:{
      type:String,
      default:null,
    },
    socialMedia:{
      type:String,
      default:null,
    },
    creditsLeft:{
      type:Number,
      default:0
    },
    rejected:{
      type:Boolean,
      default:false
    },
    rejectReason:{
      type:String,
      default:null
    },
    requestLimit:{
      type:Number,
      default:0,
      enum:[0,1,2,3]
    },
    dealerStatusHistory: [
      {
        status: {
          type: String,
          enum: {
            values: usersConstants.DEALER_STATUS_VALUES,
            message: 'Invalid dealer status',
          },
        },
        reason: {type: String, default: null},
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: 'Users',
          default: null,
        },
        updatedAt: {type: Date, default: Date.now},
      },
    ],
    // 🔴 ===== LOCATION (OPTIONAL FOR ALL) =====
    country: {type: String, default: null,},
    state: {type: String, default: null},
    city: {
      type: String,
      validate: {
        validator: function(value) {
          // City is required unless user is a Google OAuth user
          return this.isGoogleOAuthUser || value;
        },
        message: 'City is required',
      },
      default: null,
    },
    address: {
      type: String,
      validate: {
        validator: function(value) {
          // Address is required unless user is a Google OAuth user
          return this.isGoogleOAuthUser || value;
        },
        message: 'Address is required',
      },
      default: null,
    },

    // 🔴 ===== ADMIN CONTROL =====
    isBlocked: {type: Boolean, default: false},
    blockReason: {type: String, default: null, maxlength: 500},
    blockedAt: {type: Date, default: null},
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      default: null,
    },
    listingLimitOverrides: {
      premium: {type: Number, min: 0, max: 100, default: null},
      quickSell: {type: Number, min: 0, max: 100, default: null},
      standard: {type: Number, min: 0, max: 100, default: null},
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

usersSchema.index({systemRole: 1, isBlocked: 1, updatedAt: -1});

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
