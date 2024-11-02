const  mongoose = require("mongoose");


const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      items: [
        {
            productId: { 
                type: mongoose.Schema.Types.ObjectId,
                 ref: 'Product', 
                 required: true 
                },
                 name: {
                    type: String, 
                    required: true 
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                    max: 5
                },
                Salesprice: {
                    type: Number,
                    required: true
                },
                priceafteroffer: {
                    type: Number,
                },
                stock: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 1000
                },
                productimage: [{
                    type: String,
                    required: true
                }],
                Taxrate: {
                    type: Number,
                    default: 0
                },  
                is_deleted: {
                    type: Boolean,
                    default: false
                },
                size: {
                    type: String,
                    required: true,
                },
        }
      ],
      couponCode:{
        type:String,
      },
      
    },
     {
      timestamps: true
        
});

module.exports = mongoose.model('cart', cartSchema);