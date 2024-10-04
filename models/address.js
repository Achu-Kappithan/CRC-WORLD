const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({

     name:{
       type: String,
       required:true
     },
     userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
     phone:{

        type:Number,
        required:true
     },
     pincode:{

        type:Number,
        required:true
     },
   
     locality:{

        type:String,
        required:true
     },
     housename:{

        type:String,
        required:true

     },
    district:{

        type:String,
        required:true
    },
    state:{

        type:String,
        required:true
    },
    landMark:{

        type:String

    },
    altPhone:{

        type:Number
    },
     email:{

        type:String,
        required:true

     },
     addressType:{
        type:Boolean,
        default: false
     }
      
})


module.exports = mongoose.model("Address", addressSchema);