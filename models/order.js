const mongoose = require("mongoose");

const orderschema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Orderid : {
    type : String,
    required : true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      productname: {
        type: String,
        required: true,
      },
      Salesprice: {
        type: Number,
        required: true,
      },
      finalprie: {
        type: Number,
      },
      quantity: {
        type: Number,
        default: 1, 
      },
      size: {
        type: String,
        required: true,
      },
      productimage: [
        {
          type: String,
          required: true,
        },
      ],
    },
  ],
  totalPrice: {
    type: Number,
    default: 0,
  },
  coupondiscout: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Returned"],
    default: "Pending",
  },
  billingDetails: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String, 
      required: true,
    },
    pincode: {
      type: String, 
      required: true,
    },
    locality: {
      type: String,
      required: true,
    },
    housename: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    landMark: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
  },
  paymentMethod: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["COD", "Pending", "Success", "Failed"], 
    default: "COD",
  },
  razorpay_orderid: {
    type: String,
  },
  razorpay_paymentid: {
    type: String,
  },
  orderDate: {
    type: Date,
    default: Date.now, 
  },
  returnReason: {
    type: String,
  },
});

module.exports = mongoose.model("Order", orderschema);
