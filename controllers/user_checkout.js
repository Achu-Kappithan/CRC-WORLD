
const User = require("../models/user_models")
const Address = require("../models/address")
const Cart = require("../models/cart")
const Order = require("../models/order")
const Product = require("../models/product")

//for loading  chekout page

const  load_checkout = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const userdata =  await User.findById({_id:userId}).populate('addressId').exec()
        const cardata  = await Cart.findOne({user:userId})
        console.log("this is the cart data for current user",cardata)
        const message = req.flash("message");
        const type =  req.flash("type");

        // console.log("this is the data send to user profile",userdata)
       return res.status(200).render("checkout",{userdata ,cardata ,message ,type })
    } catch (err) {

        console.log("error for loading checkout page ",err)
        res.status(500).render("user404",{message:"Something went worng can't load checkout page"})
        
    }
}

// for updating  existing address in the checkout page

const checkoutupdate_address = async (req,res)=>{
    try {
        const id = req.query.id;
        const {name, housename, locality, district, state, pincode, phone, landmark, altphone}= req.body
        console.log("this is the data for the new updateion",req.body)
        console.log('this is the id for update address',id)


        await Address.findByIdAndUpdate(id,{
            $set:{  name : name,
                phone : phone,
                pincode : pincode,
                locality : locality,
                housename : housename,
                district : district,
                state : state,
                landMark : landmark,
                altPhone : altphone 
            }
        });
        req.flash("message","Address Upated successfully")
        req.flash("type","success")
        return  res.status(200).redirect("/user_checkout")
    } catch (err) {
        console.log("error for updating the user address",err)
        req.flash("message","Fail to updae the addrss try again..!")
        req.flash("type","error")
        return res.status(500).redirect("/user_checkout")
        
    }
}

// for adding new address  from checkout page

const checkout_newaddress = async (req,res)=>{
    try {
        const { name, email, housename, locality, district, state, pincode, phonenumber, altnumber, landmark} =req.body
        const userid = req.session.user_id;
        
        if(!userid){
            req.flash("message","User is Not valid");
            req.flash("type","error")
            return res.statun(4001).redirect("/user_checkout")
            console.log("userId is not valid",userid)
        }


        const address = new Address({
            name : name,
            userId : userid, 
            phone : phonenumber,
            pincode : pincode,
            locality : locality,
            housename : housename,
            district : district,
            state : state,
            landMark : landmark,
            altPhone : altnumber,
            email : email
        })
         const addressData =await address.save()

           await User.findByIdAndUpdate(
            { _id: userid },
            { $push: { addressId: addressData._id } },
            { new: true }
        );
        req.flash("message","Adress Added Sucessfully");
        req.flash("type","success")
        return  res.status(200).redirect("/user_checkout")
    } catch (err) {
        console.log("error for adding address",err)
        res.status(500).render("user404",{message:"unable to add address try again...!"})
    }
}
 
// for placeing a new order

const place_order = async (req, res) => {
    try {
      const addressId = req.body.selectedAddress; 
      const paymentMethod = req.body.paymentMethod; 
      const userId = req.session.user_id;

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
        paymentStatus: paymentMethod, 
        orderDate: Date.now(),
      });
  
      await neworder.save();

      for (let item of cartData.items) {
        const product = await Product.findById(item.productId);
  
        if (product) {
          const sizeIndex = product.sizes.findIndex((sizeObj) => sizeObj.size === item.size);
            product.sizes[sizeIndex].stock -= item.quantity;
            await product.save();
          
        }
      } 

      await Cart.findOneAndUpdate({ user: userId }, { items: [] });
      return res.status(200).render("order_successfull",{  newOrder:neworder });
      
    } catch (err) {
      console.error("Error while placing order:", err);
     return  res.status(500).render("user404",{message:"Something went wrong. Please try again."});
    }
  };



module.exports = {
    load_checkout,
    checkoutupdate_address,
    checkout_newaddress,
    place_order
}