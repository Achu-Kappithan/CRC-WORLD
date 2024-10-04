const mongoose = require("mongoose");

const sizeSchema = mongoose.Schema({
    size: {
        type: String,
        required: true,
        enum: ['small', 'Medium', 'Large'], 
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        max: 1000
    },
    Salesprice: {
        type: Number,
        required: true
    },
    Actualprice: {
        type: Number,
        required: true
    },

});

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
    Taxrate: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    Salesprice: {
        type: Number,
        required: true
    },
    Actualprice: {
        type: Number,
        required: true
    },

    sizes: [sizeSchema] 
});

module.exports = mongoose.model('Product', productSchema);






