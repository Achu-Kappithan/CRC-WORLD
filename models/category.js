const mongoose = require("mongoose");

const offersechema = mongoose.Schema({
    offerName: {
        type: String,
        required: true
    },
    offerdiscription :{
        type : String,
        required : true,
    },
    offerDiscountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    offerStartDate: {
        type: Date,
        required: true
    },
    offerExpiryDate: {
        type: Date,
        required: true
    },
    offerStatus: {
        type: Boolean,
        default:true
    }
  },{ timestamps: true })


const categorySchema = mongoose.Schema({
    name: {
        type : String,
        required : true
    },
    discription : {
        type : String,
        required : true

    },
    is_deleted : {
        type : Boolean,
        default : false
    },
    categoryoffer :  offersechema

})

module.exports = mongoose.model('category',categorySchema);