
const User = require("../models/user_models")
const Address = require("../models/address")
const Cart = require("../models/cart")
const Order = require("../models/order")
const Product = require("../models/product")
const Coupons = require("../models/coupons")
const Wallet = require("../models/wallet")
const statuscode = require("../utils/statusCode")

//for loading  chekout page

const  load_checkout = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const wallet = await Wallet.findOne({userId:userId})
        // console.log("my wallet",wallet)
        const coupons = await Coupons.find({ couponStatus: true })
        const userdata =  await User.findById({_id:userId}).populate('addressId').exec()
        const cardata  = await Cart.findOne({user:userId})
        // console.log("this is the cart data for current user",cardata)
        const message = req.flash("message");
        const type =  req.flash("type");

        // console.log("this is the data send to user profile",userdata)
       return res.status(statuscode.OK).render("checkout",{userdata ,cardata ,message ,type ,coupons , wallet})
    } catch (err) {

        console.log("error for loading checkout page ",err)
        res.status(statuscode.INTERNAL_SERVER_ERROR).render("user404",{message:"Something went worng can't load checkout page"})
        
    }
}

// for updating  existing address in the checkout page

const checkoutupdate_address = async (req,res)=>{
    try {
        const id = req.query.id;
        const {name, housename, locality, district, state, pincode, phone, landmark, altphone}= req.body
        // console.log("this is the data for the new updateion",req.body)
        // console.log('this is the id for update address',id)


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
        return  res.status(statuscode.OK).redirect("/user_checkout")
    } catch (err) {
        console.log("error for updating the user address",err)
        req.flash("message","Fail to updae the addrss try again..!")
        req.flash("type","error")
        return res.status(statuscode.INTERNAL_SERVER_ERROR).redirect("/user_checkout")
        
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
            return res.status(statuscode.BAD_REQUEST).redirect("/user_checkout")
            // console.log("userId is not valid",userid)
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
        return  res.status(statuscode.OK).redirect("/user_checkout")
    } catch (err) {
        console.log("error for adding address",err)
        res.status(statuscode.INTERNAL_SERVER_ERROR).render("user404",{message:"unable to add address try again...!"})
    }
}

// for  applaying coupons

const applycouppons = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { couponcode, grandTotal } = req.body; 
        const grandtotal = Number(grandTotal);


        // console.log("typeof:", typeof(grandtotal));
        // console.log("grandtotal:", grandtotal); 

        const coupons = await Coupons.findOne({ couponCode: couponcode, couponStatus: true });
        if (!coupons) {
            return res.json({ success: false, message: "Invalid or inactive coupon code" });
        }

        if (coupons.userBy.length >= coupons.Userlimit) {
            coupons.couponStatus = false;
            await coupons.save();
            return res.json({ success: false, message: "This coupon has expired" });
        }

        if (coupons.userBy.includes(userId)) {
            return res.json({ success: false, message: "You have already used this coupon" });
        }

        if (grandtotal < coupons.minAmount) {
            return res.json({ success: false, message: `This coupon is available only for purchases over ${coupons.minAmount}` });
        }

        const offerprice = Math.min((grandtotal * coupons.couponDiscount) / 100, coupons.maxAmount);
        // console.log("offerprice:", offerprice); 


        res.status(statuscode.OK).json({ offerprice, success: true, message: "Coupon added successfully" });
    } catch (err) {
        console.log("Error applying coupon:", err);
        res.status(statuscode.INTERNAL_SERVER_ERROR).render("user404", { message: "Unable to complete the request" });
    }
};

// for removing existing coupons

const remove_coupons = async (req,res)=>{
    try {
        const userid = req.session.user_id
        const { grandTotal ,couponcode } = req.body;
        const offerprice = 0;

        return res.status(statuscode.OK).json({success : true , message :"Coupon removed successfully"})
        
    } catch (err) {
        console.log("error for removeing coupoons ",err)
        return res.status(statuscode.INTERNAL_SERVER_ERROR).render("user404",{message : "Unable to complete the request try again..!"})
    }
}
 

module.exports = {
    load_checkout,
    checkoutupdate_address,
    checkout_newaddress,
    applycouppons,
    remove_coupons
}