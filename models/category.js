const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: {
        type : String,
        required : true
    },
    discription : {
        type : String,
        required : true

    },
    is_delited : {
        type : Boolean,
        default : false
    }


})

module.exports = mongoose.model('category',categorySchema);