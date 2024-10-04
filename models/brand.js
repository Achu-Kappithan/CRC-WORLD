const mongoose = require("mongoose");

const brandSchema = mongoose.Schema({
    name: {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true

    },
    image: {
        type: String, 
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    is_deleted : {
        type : Boolean,
        default : false
    },
    


})

module.exports = mongoose.model('brand',brandSchema);

