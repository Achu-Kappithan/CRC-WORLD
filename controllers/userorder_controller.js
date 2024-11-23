const Address = require("../models/address")
const Cart = require("../models/cart")
const Order = require("../models/order")
const Product = require("../models/product")
const razorpay = require("../config/razorpayconfig")
const Coupon = require("../models/coupons")
const { findOneAndUpdate } = require("../models/user_models")
const Wallet = require("../models/wallet")


// for placeing a new order

const place_order = async (req, res) => {
    try {
      const addressId = req.body.selectedAddress; 
      const paymentMethod = req.body.paymentMethod; 
      const userId = req.session.user_id;
      let grandtotal = req.body.grandtotal; 
      const couponcode = req.body.couponcode?   req.body.couponcode : null
      const couponamt = req.body.couponamt;
      grandtotal = Number(grandtotal);

      
      
      if(grandtotal>10000 && paymentMethod=="COD" ){
        req.flash("message","Cash on Delivery is only available for orders below ₹10,000. Please select another payment method to proceed")
        req.flash("type","info")
        return res.status(401).redirect("/user_checkout")
      }

      if(!addressId && !paymentMethod){
        req.flash("message","Plz Select address and Payment Method");
        req.flash("type","warning")
        return res.status(400).redirect("/user_checkout");
      }
      const walletdata = await Wallet.findOne({userId:userId})

      if (paymentMethod == "mywallet") {
        if (!walletdata || walletdata.balance < grandtotal) {
            req.flash("message", "Insufficient wallet balance to process the order.");
            req.flash("type", "warning");
            return res.status(403).redirect("/user_checkout");
        }
    }  
      const orderAddress = await Address.findById(addressId);
      const cartData = await Cart.findOne({ user: userId });
      
  
      if (!cartData || cartData.items.length === 0) {
        req.flash("message","Your cart is empty plz add items");
        req.flash("type","warning")
        return res.status(400).redirect("/user_checkout");
      }

      for (let value of cartData.items){
        const productdata = await Product.findById({_id:value.productId});
        for(let item of productdata.sizes){
          if(item.stock < value.quantity && value.size == item.size){
            req.flash("message","Sorry, Invalid stock  Item is not available ");
            req.flash("type","warning")
            return res.status(400).redirect("/user_checkout");
          }
        }
      }
  
      const totalPrice = cartData.items.reduce((acc, curr) => {
        return acc + (curr.Salesprice * curr.quantity);
      }, 0);

      function generateOrderId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let orderId = '';
        
        for (let i = 0; i < 12; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          orderId += characters[randomIndex];
        }
        
        return orderId;
      }

      let shippingcharge =  grandtotal < 2000  ? 40 : 0;
      let finalprice =  grandtotal + shippingcharge
      // console.log("finalprice is  ",finalprice)
      // console.log("grandtotal is ",grandtotal)
      // console.log(typeof(grandtotal))
      

      const neworder = new Order({
        userId: userId,
        Orderid : generateOrderId(),
        items: cartData.items.map((item) => ({
          productId: item.productId,
          productname: item.name,
          Salesprice: item.Salesprice,
          finalprie : item.priceafteroffer,
          quantity: item.quantity,
          itemStatus : "Pending",
          size: item.size,
          productimage: item.productimage,
        })),

        totalPrice: finalprice,
        coupondiscout : couponamt,
        shippingcharge : shippingcharge,
        status: "Pending",

        billingDetails: {
          name: orderAddress.name,
          phone: orderAddress.phone,
          pincode: orderAddress.pincode,
          locality: orderAddress.locality,
          housename: orderAddress.housename,
          district: orderAddress.district,
          state: orderAddress.state,
          landMark: orderAddress.landMark || "", 
          email: orderAddress.email,
        },
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'COD' : 'Pending',
        orderDate: Date.now(),
      });
  
     const orderdata = await neworder.save();


      for (let item of cartData.items) {
        const product = await Product.findById(item.productId);
  
        if (product) {
          const sizeIndex = product.sizes.findIndex((sizeObj) => sizeObj.size === item.size);
            product.sizes[sizeIndex].stock -= item.quantity;
            await product.save();
          
        }
      } 

      await  Coupon.findOneAndUpdate({couponCode: couponcode},
        {$push:{userBy: userId}}
      ) 

      await Cart.findOneAndUpdate({ user: userId }, { items: [] });

      if(paymentMethod == "mywallet"){
        walletdata.balance = walletdata.balance-grandtotal;
        walletdata.transactions.push({
          orderId : orderdata._id,
          placedorderid : orderdata.Orderid,
          amount : grandtotal,
          type : "wallet payment",
          walletTransactionStatus : "paid"
        })
        await walletdata.save()
        await Order.findByIdAndUpdate(
          {_id:orderdata._id},
          {$set:{paymentStatus:"Success"}}
        )
       }
       
      if(paymentMethod =="onlinepayment"){
        return res.status(200).render("online_paymentcnfm",{orderdata})
      }
      return res.status(200).render("order_successfull",{  newOrder:neworder });
      
    } catch (err) {
      console.error("Error while placing order:", err);
     return  res.status(500).render("user404",{message:"Something went wrong. Please try again."});
    }
  };

  // for razorpay payment intragration


const  razorpay_order = async (req,res)=>{
    const amount = req.body.amount * 100; 
    const db_orderid = req.body.order_id;

    try {
        const options = {
            amount,
            currency: "INR",
            receipt: `order_rcptid_${Math.random().toString(36).substring(7)}`
        };
        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            order,
            db_orderid
        });
    } catch (error) {
        console.error("Error in creating Razorpay order:", error);
        res.status(500).json({
            success: false,
            message: "Order creation failed",
        });
    }   
}


const verify_payment = async (req, res) => {
  console.log("verifying is working");
  const crypto = require("crypto");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_orderid, amount } = req.body;

  try {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_orderid) {
      console.log("Payment failed - Missing payment fields");
      await Order.findByIdAndUpdate({ _id: db_orderid }, { paymentStatus: "Failed" });
      return res.status(400).json({ 
        success: false, 
        message: "Payment failed", 
        redirectUrl: "/payment_failed" 
      });
    }

    const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      await Order.findByIdAndUpdate({ _id: db_orderid }, { paymentStatus: "Success" });
      console.log("Payment success");

      const totalamt = amount / 100;
      return res.json({
        success: true,
        redirectUrl: "/load_paymentsuccess",
        data: { totalamt, razorpay_payment_id }
      });
    } else {
      console.log("Payment verification failed - Signature mismatch");
      await Order.findByIdAndUpdate({ _id: db_orderid }, { paymentStatus: "Failed" });
      return res.json({
        success: false,
        message: "Payment verification failed",
        redirectUrl: "/payment_failed"
      });
    }
  } catch (error) {
    console.error("Error in payment verification:", error);
    if (db_orderid) {
      await Order.findByIdAndUpdate({ _id: db_orderid }, { paymentStatus: "Failed" });
    }
    return res.status(500).json({ 
      success: false, 
      message: "Payment verification error",
      redirectUrl: "/payment_failed" 
    });
  }
};





// for loading payment success page

const load_paymentsuccess = async (req,res)=>{
    try {
       const totalamt= req.query.amount / 100 
       console.log("totalamt",totalamt)
        res.render("payment_success",{totalamt})
        
    } catch (err) {
        console.log("error for loading paymest success page",err)
        return res.status(500).render("user404",{message:"Unable to complate the request"})
    }
}

// for loading  payment faild page

const payment_faild  = async ( req,res)=>{
  try {
    const orderid = req.query.id;
    console.log("order id",orderid)
    const orderdata = await Order.findById({_id:orderid})
    return res.status(200).render("paymentfaild",{orderdata})
    
  } catch (err) {
    console.log("error for loading payment faildpage",err)
    
  }
}


  module.exports = {
    place_order,
    razorpay_order,
    verify_payment,
    load_paymentsuccess,
    payment_faild
  }
