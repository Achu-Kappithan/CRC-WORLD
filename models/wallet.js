const mongoose = require('mongoose');

const walletTransactions = mongoose.Schema({

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order', 
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    walletTransactionStatus:{
        type:String,
        enum: ["refunded","pending", "paid"],
         default: "pending"
    }
}, { timestamps: true });

const walletSchema =  mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true 
    },
    balance: {
        type: Number,
        required: true,
        default: 0 
    },

   transactions:[walletTransactions]

}, { timestamps: true });


module.exports = mongoose.model("wallet",walletSchema)