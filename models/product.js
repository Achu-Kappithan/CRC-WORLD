const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    productname: {
        type: String,
        required: true
    },
    productdescription: {
        type: String,  
        required: true
    },
    productimage: [{
        type: String,
        required: true
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    brand: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: "brand",
        required: true
    },
    Salesprice: {
        type: Number,
        required: true
    },
    Actualprice: {
        type: Number,
        required: true
    },
    Taxrate: {
        type: Number,
        default: 0
    },
    quentity: {
        type: Number,
        required: true,
        min: 0,
        max: 1000
    },
    rating: {
        type: Number,
        default: 0,
    },
    is_delited : {
        type: Boolean,
        default: 0
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema); 





