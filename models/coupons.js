const mongoose = require("mongoose")

const coupon_schema =  mongoose.Schema({
    couponName:{
        type:String,
        required:true
    },
    couponDescription: {
        type: String,
        required: false
    },
    
    couponCode:{
        type:String,
        required:true,
        unique:true
    },
    couponDiscount:{
        type:Number,
        required:true
    },
    couponStatus:{
        type:Boolean,
        required:true
    },
    maxAmount:{
        type:Number,
        required:true
    },
    minAmount:{
        type:Number,
        required:true
    },
    Userlimit:{
        type:Number,
        required:true
    },
    userBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]
}, { timestamps: true });

module.exports = mongoose.model("coupon",coupon_schema)