const mongoose=require('mongoose');
const {hideTimeStampsPlugin}=require('./plugins');
const Schema=mongoose.Schema;

const chatSchema=new Schema({
    from:{
        type:Schema.Types.ObjectId,
        ref:'Users',
        required:true,
    },
     to:{
        type:Schema.Types.ObjectId,
        ref:'Users',
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
    isRead: {
    type: Boolean,
    default: false,
  }, 
}, {
    timestamps: true,
    id: false,
    versionKey: false,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  });
  module.exports=mongoose.model('Chat',chatSchema)