const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type : String,
        required : true
    },
    image: [{
        type : String,
        required : true
    }],
    breand : {
        type: String,
        default : ''
    },
    price : {
        type : Number,
        default :0
    },
    category: {
        type :mongoose.Schema.Types.objectId,
        ref: "Category",
        required :true
    },
    countInstock: {
        type : Number,
        required: true,
        min: 0,
        max: 1000
    },
    rating: {
        type :Number,
        default :0,

    },
    quentity : {
        type : Number,
        required : true
    },
    dateCreated : {
        type : Date,
        default : Date.now
    }

})






exports.Product = mongoose.model('product',productSchema)