const Orders = require("../models/order")
const User = require("../models/user_models")

// for loading order list

const load_orderlist = async (req,res)=>{
    try {
        const page = req.query.page || 1 ;
        const limit = 6;

        const orderdata = await Orders.find()
        .populate("userId")
        .skip((page-1)*limit)
        .limit(limit)

        const totalorders = await Orders.countDocuments();
        const totalPages = Math.ceil(totalorders / limit)

        return res.status(200).render("order_list",{orderdata ,totalPages ,page })
    } catch (err) {
        console.log("error for loading order list ",err)
        return res.status(500).render("404",{message:"unable to complate your request"})
    }
}

// for loading order details page

const load_orderdetails = async (req,res)=>{
    try {
        id = req.query.id;
        const orderdetails = await Orders.findById(id).populate("userId");
        // console.log("order details for showing  admin order details",orderdetails)
        res.status(200).render("orderdetails",{order:orderdetails})
        
    } catch (err) {
        console.log("error for loading orderdetails page",err)
        res.status(500).render("404",{message:"Unable to load order details page Try again..!"})
        
    }
}


// for updating the order status

const Update_orderstatus = async (req,res)=>{
    try {
        const orderid = req.body.orderid;
        const status = req.body.selectedstatus;
        console.log("req.body of  update status",req.body)

         await Orders.findByIdAndUpdate(
            orderid,
            {$set:{ status :status }}
        )
        res.json({ success : true})
    } catch (err) {
        console.log("error for updating the order status",err)
        res.status(500).render("404",{message: "Unable to complate your request"})
    }
}


// for adding pagenation

const pagenation = async (req,res)=>{
    try {
        const page = req.query.page || 1 ;
        const limit = 8;

        const orderlist = await Orders.find()
        .skip((page-1)*limit)
        .limit(limit)

        const totalorders = await Orders.countDocuments();

        res.status(200).render()
        
    } catch (err) {
        console.log("error for adjesting pagenation ",err)
        
    }
}


module.exports = {
    load_orderlist,
    load_orderdetails,
    Update_orderstatus
}