const Address = require("../models/address")
const Cart = require("../models/cart")
const Order = require("../models/order")
const Product = require("../models/product")


// for placeing a new order

const place_order = async (req, res) => {
    try {
      const addressId = req.body.selectedAddress; 
      const paymentMethod = req.body.paymentMethod; 
      const userId = req.session.user_id;
      const grandtotal = req.body.grandtotal; 
      
      if(grandtotal>10000){
        req.flash("message","Cash on Delivery is only available for orders below ₹10,000. Please select another payment method to proceed")
        req.flash("type","info")
        return res.status(401).redirect("/user_checkout")
      }

      if(!addressId && !paymentMethod){
        req.flash("message","Plz Select address and Payment Method");
        req.flash("type","warning")
        return res.status(400).redirect("/user_checkout");
      }
  
      const orderAddress = await Address.findById(addressId);
      const cartData = await Cart.findOne({ user: userId });
  
      if (!cartData || cartData.items.length === 0) {
        req.flash("message","Your cart is empty plz add items");
        req.flash("type","warning")
        return res.status(400).redirect("/user_checkout");
      }
  
      const totalPrice = cartData.items.reduce((acc, curr) => {
        return acc + (curr.Salesprice * curr.quantity);
      }, 0);
  
      const neworder = new Order({
        userId: userId,
        items: cartData.items.map((item) => ({
          productId: item.productId,
          productname: item.name,
          Salesprice: item.Salesprice,
          quantity: item.quantity,
          size: item.size,
          productimage: item.productimage,
        })),

        totalPrice: totalPrice,
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

      await Cart.findOneAndUpdate({ user: userId }, { items: [] });

      if(paymentMethod =="onlinepayment"){
        return res.status(200).render("online_paymentcnfm",{orderdata})
      }
      return res.status(200).render("order_successfull",{  newOrder:neworder });
      
    } catch (err) {
      console.error("Error while placing order:", err);
     return  res.status(500).render("user404",{message:"Something went wrong. Please try again."});
    }
  };



  module.exports = {
    place_order
  }
