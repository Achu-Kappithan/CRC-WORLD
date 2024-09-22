const  mongoose = require("mongoose");


const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
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
                price: {
                    type: Number,
                    required: true 
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                    max: 5
                },
                is_selected: {
                    type: Boolean,
                    default: true
                },
                Salesprice: {
                    type: Number,
                    required: true
                },
                Actualprice: {
                    type: Number,
                    required: true
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