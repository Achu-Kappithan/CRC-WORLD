
const mongoose = require('mongoose');


const wishListSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product' 
  }]
}, { timestamps: true });



module.exports = mongoose.model("wishlist",wishListSchema)
