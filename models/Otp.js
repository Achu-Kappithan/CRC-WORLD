const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email:{
    type: String,
    required:true
  },
  otp:{
    type: String,
    required:true
  },
  resendotp:{
    type: String,
  },
 
  createdAt: {
     type: Date, 
     expires: '5m', 
     default: Date.now 
     
    }
});

module.exports = mongoose.model('otp', otpSchema);