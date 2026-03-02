const mongoose=require('mongoose');
const {hideTimeStampsPlugin}=require('./plugins');
const Schema=mongoose.Schema;

const paymentSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'Users',
        required:true,
    },
    vehicleId:{
        type:Schema.Types.ObjectId,
        ref:'Vehicles',
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    paymentMethod:{
        type:String,
        default:'Stripe'
    },
    paymentStatus:{
        type:String,
        enum:['pending','success','failed'],
        default:'pending'
    },
    paidAt:Date,    
}, {
    timestamps: true,
    id: false,
    versionKey: false,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  });

  paymentSchema.plugin(hideTimeStampsPlugin);

  module.exports=mongoose.model('Payment',paymentSchema);