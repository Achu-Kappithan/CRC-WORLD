const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_active:{
        type:Boolean,
        default: true
    },
    addressId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
    }],       
        pass_resettoken: {
        type: String
    },
    pass_resettime: {
        type: Date
    }
    
});

module.exports = mongoose.model("User",userSchema);