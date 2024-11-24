const User = require("../models/user_models");
const Address = require("../models/address");
const Orders = require("../models/order")
const Wallet = require("../models/wallet");
const Product = require("../models/product")
const {Prepotional_couponamt}  = require("../utils/coupon_util")

// for loading  userprofile page

const load_userprofile = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const userdata =  await User.findById({_id:userId}).populate('addressId').exec()
        const message = req.flash("message");
        const type =  req.flash("type");
        // console.log("this is the data send to user profile",userdata)
        res.status(200).render("userprofile",{userdata , message, type})
        
    } catch (err) {
        console.log("error for loading user profile",err)
        res.status(500).render("user404",{message:"Unable to load user profile"})
        
    }
}

// add new addrss to the database

const add_newaddress = async (req,res)=>{
    try {
        const { name, email, housename, locality, district, state, pincode, phonenumber, altnumber, landmark} =req.body
        const userid = req.session.user_id;
        
        if(!userid){
            req.flash("message","User is Not valid");
            req.flash("type","error")
            res.statun(4001).redirect("/user_Profile")
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

         const pushAddressIntoUser = await User.findByIdAndUpdate(
            { _id: userid },
            { $push: { addressId: addressData._id } },
            { new: true }
        );
        req.flash("message","Adress Added Sucessfully");
        req.flash("type","success")
        res.status(200).redirect("/user_Profile")
    } catch (err) {
        console.log("error for adding address",err)
        res.status(500).render("user404",{message:"unable to add address try again...!"})
    }
}

//  for updating existing address

const update_address = async (req,res)=>{
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
        res.status(200).redirect("/user_Profile")
    } catch (err) {
        console.log("error for updating the user address",err)
        req.flash("message","Fail to updae the addrss try again..!")
        req.flash("type","error")
        res.status(500).redirect("/user_Profile")
        
    }
}

//for removing a adderess from the addresslisst

const delete_address = async (req,res)=>{
    try {
        const addressid = req.query.id
        const userId = req.session.user_id;

        await Address.findByIdAndDelete(addressid)
        await User.findByIdAndUpdate(userId,{
            $pull :{addressId :addressid}
        });
        req.flash("message","Address successfully removed")
        req.flash("type","success")
        res.status(200).redirect("/user_Profile")
    } catch (err) {
        console.log("error for deleting user addresss",err)
        req.flash("message","Something went Wrong please Try again...!")
        req.flash("type","error")
        res.status(500).redirect("/user_Profile")
        
    }
}


// for updating  uerprofile

const update_userprofile = async(req,res)=>{
    try {
        const userid = req.session.user_id;
        const { first_name, last_name} =req.body
        await User.findByIdAndUpdate({_id : userid},
            {$set: {firstname :first_name , lastname :last_name}},
            {new : true}
        )
        req.flash("message","Profile updated Sucessfully")
        req.flash("type","success")
        res.status(200).redirect("/user_Profile")
        
    } catch (err) {
        console.log("error for updating the userprofile",err)
        res.status(500).render("user404",{message: "Unablelet to complate the request"})
    }
}

//for loading order summaypage

const load_ordersummary = async (req,res)=>{
    try {
        orderid = req.query.orderid
        const orderdetails = await Orders.findById(orderid)
        console.log("this is the order details",orderdetails)
        return res.status(200).render("order_summary",{ orderdetails})
        
    } catch (err) {
        console.log("error for loading product summary page",err)
        return res.status(500).render("user404",{message: "unable to load order summaypage"})
        
    }
}


// for lading my order page

const load_myorder = async (req,res)=>{
    try {
        const message = req.flash("message");
        const type =  req.flash("type");
        const userId = req.session.user_id;
        const orders = await Orders.find({ userId: userId })
        const order_details = orders.reverse()
        // console.log("this is orderdetails",order_details)
        return res.status(200).render("myorders",{orderdetails:order_details ,message , type})
        
    } catch (err) {
        console.log("error for loading  order summary page ",err)
       res.status(500).render("user404",{message: "Unable to load my order page Try again...!"}) 
    }
}

// for cancel order

const cancell_order = async (req,res)=>{
    try {
        const id = req.body.id.trim();
        const userid = req.session.user_id;
        const cancelledorder = await Orders.findById(id)
        let return_amt =  cancelledorder.totalPrice -  cancelledorder.shippingcharge
            

        if(!cancelledorder){
       return res.json({success:false,message:"Can't cancelled order try again..!"})

        }else if(cancelledorder.paymentMethod == "onlinepayment" || cancelledorder.paymentMethod == "mywallet"){
            const wallet = await Wallet.findOne({userId:userid})
            if(!wallet){
                wallet = new Wallet({
                    userId :userid,
                    balance : 0,
                    transactions : []
                })
            } 
            
        wallet.balance += return_amt;

        wallet.transactions.push({
            orderId : id,
            placedorderid : cancelledorder.Orderid,
            amount : return_amt,
            type : cancelledorder.paymentMethod,
            walletTransactionStatus : "refunded"
        })

        await wallet.save();

        cancelledorder.status = "Cancelled"
        cancelledorder.items.forEach(value => {
            value.itemStatus = "Cancelled"
        });
        await cancelledorder.save();
        return res.status(200).json({success:true, message:"Order Cancelled successfully and Payment credited to the wallet..!"})

        }else {

        cancelledorder.status = "Cancelled"
        cancelledorder.items.forEach(value => {
            value.itemStatus = "Cancelled"
        });
        await cancelledorder.save();
        return res.json({success:true, message:"Order Cancelled successfully"})
        }

    } catch (err) {
        console.log("error for cancelling a order",err)
        res.status(500).render("user404",{message:"Something went rong Tray again..!"})
        
    }
} 

// for loading wallet 

const  load_wallet = async (req,res)=>{
    try {
        const userid = req.session.user_id;
        const walletdata = await Wallet.findOne({userId:userid})
        return res.status(200).render("wallet",{walletdata})
    } catch (err) {
        console.log("error for loading user wallset page",err)
        return res.status(500).render("user404",{message: "Unable to complete the request try again..!"})
        
    }
}

// for  return a order 

const return_order = async (req,res)=>{
    try {
        const id = req.body.id;
        const userid = req.session.user_id
        // console.log("userid is ",userid)
        // console.log("id for return the order",id)

        const orderdata = await Orders.findById({_id:id});
        // console.log("order details for refund",orderdata)
        const return_amt = orderdata.totalPrice - orderdata.shippingcharge

        let wallet = await Wallet.findOne({userId:userid});

        if(!wallet){
            wallet = new Wallet({
                userId :userid,
                balance : 0,
                transactions : []
            })
        }

        wallet.balance += return_amt;

        wallet.transactions.push({
            orderId : id,
            placedorderid : orderdata.Orderid,
            amount : return_amt,
            type : orderdata.paymentMethod,
            walletTransactionStatus : "refunded"
        })

        await wallet.save();

        orderdata.status = "Returned"

        await orderdata.save();

        return res.status(200).json({success : true , message: "Order returned successfully, refund credited to wallet"})

    } catch (err) {
        console.log("error for return the order",err)
        return res.status(500).render("user404",{message : "Unable to complete the request try again..!"})
        
    }
}


// for indivudualy cancell a item

const individual_cancell = async (req,res)=>{
    try {
        const productid = req.query.id;
        const{ order_id,itemsize } = req.body
        const userid = req.session.user_id

        const orderdetails = await Orders.findById({_id: order_id})

        if(orderdetails.status !== "Pending" && orderdetails.status !== "Shipped"  ){
            return res.status(400).json({ success:false, message: `Can't change the status of ${orderdetails.status} item`});
        }

        let itemtotalprice = 0;
        let cancelledquentity = 0;

        for (let item of orderdetails.items){
            if(item.productId == productid && item.size == itemsize){
                item.itemStatus = "Cancelled";
                itemtotalprice = item.finalprie* item.quantity; 
                cancelledquentity = item.quantity
            }
        }
        let couponamt = orderdetails.coupondiscout ?? 0;
        let totalpricebefore = orderdetails.items.reduce((acc, curr) => {
                                    acc += curr.finalprie * curr.quantity; 
                                return acc;
                                 }, 0)
        let totalprice =orderdetails.cancelleditemAmt ? totalpricebefore - orderdetails.cancelleditemAmt : totalpricebefore
        let coupondiscout =  Prepotional_couponamt(itemtotalprice ,totalprice ,couponamt) ;
        console.log("coupon disamt",coupondiscout)

       orderdetails.coupondiscout -= coupondiscout
       orderdetails.cancelleditemAmt += itemtotalprice 
       orderdetails.returnDate = new Date()

       let orderdata = await orderdetails.save()
       let amt_return = itemtotalprice  - coupondiscout

    const updateResult = await Product.updateOne(
        {
            _id: productid, 
            "sizes.size": itemsize 
        },
        {
            $inc: { "sizes.$.stock": cancelledquentity } 
        }
    );

    // console.log("updated stock result ",updateResult)

       if(orderdetails.paymentMethod == "onlinepayment" || orderdetails.paymentMethod == "mywallet"){
        const  walletdata = await Wallet.findOne({userId :userid})
        console.log("user wallet",walletdata)

        walletdata.balance += amt_return
        walletdata.transactions.push({
          orderId : orderdata._id,
          placedorderid : orderdata.Orderid,
          amount : amt_return,
          type : "Indivudal Cancell",
          walletTransactionStatus : "refunded"
        })
        await walletdata.save()
       }
       

      return res.status(200).send({ success:true, orderdata, message: "Item cancelled and coupon adjusted successfully." });

    } catch (err) {
       console.log("error for individual item cancell ",err)
       return res.status(500).render("user404",{message:"Unable to  complete the request try again..!"})
        
    }
}


// for returning individual items

const individual_return = async (req,res)=>{
    try {
        const productid = req.query.id;
        const{ order_id,itemsize } = req.body
        const userid = req.session.user_id
        console.log(`productid =${productid} order_id =${order_id} itemsize =${itemsize}`)

        const orderdetails = await Orders.findById({_id: order_id})

        if(orderdetails.status !== "Delivered"  ){
            return res.status(400).json({ success:false, message: `Can't change the status of ${orderdetails.status} item`});
        }

        let itemtotalprice = 0;
        let cancelledquentity = 0;

        for (let item of orderdetails.items){
            if(item.productId == productid && item.size == itemsize){
                item.itemStatus = "Returned";
                itemtotalprice = item.finalprie* item.quantity; 
                cancelledquentity = item.quantity
            }
        }
        let couponamt = orderdetails.coupondiscout ?? 0;
        let totalpricebefore = orderdetails.items.reduce((acc, curr) => {
                                    acc += curr.finalprie * curr.quantity; 
                                return acc;
                                 }, 0)
        let totalprice =orderdetails.cancelleditemAmt ? totalpricebefore - orderdetails.cancelleditemAmt : totalpricebefore
        let coupondiscout =  Prepotional_couponamt(itemtotalprice ,totalprice ,couponamt) ;
        console.log("coupon disamt",coupondiscout)

       orderdetails.coupondiscout -= coupondiscout
       orderdetails.cancelleditemAmt += itemtotalprice 
       orderdetails.returnDate = new Date()

       let orderdata = await orderdetails.save()
       let amt_return = itemtotalprice  - coupondiscout

       const updateResult = await Product.updateOne(
        {
            _id: productid, 
            "sizes.size": itemsize 
        },
        {
            $inc: { "sizes.$.stock": cancelledquentity } 
        }
    );


    const  walletdata = await Wallet.findOne({userId :userid})
        console.log("user wallet",walletdata)

        walletdata.balance += amt_return
        walletdata.transactions.push({
          orderId : orderdata._id,
          placedorderid : orderdata.Orderid,
          amount : amt_return,
          type : "Indivudal Return",
          walletTransactionStatus : "refunded"
        })
        await walletdata.save()

        return res.status(200).json({ success:true, orderdata, message: "Item successfully returned. Refund is being processed to your wallet." });
        
    } catch (err) {
        console.log("error for individual item return ",err)
        res.status(500).render("user404",{message: "Unable to complate the request plz try againg"})
    }
}







module.exports = {
    load_userprofile,
    add_newaddress,
    update_address,
    delete_address,
    update_userprofile,

    //order related routes
    load_ordersummary,
    load_myorder,
    cancell_order,
    load_wallet,
    return_order,

    // item individual  handling

    individual_cancell,
    individual_return

}