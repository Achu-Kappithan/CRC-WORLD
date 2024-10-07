const Orders = require("../models/order")
const User = require("../models/user_models")

const load_orderlist = async (req,res)=>{
    try {
        const orderdata = await Orders.find().populate("userId")
        console.log("this is teh order data in admin",orderdata)
        return res.status(200).render("order_list",{orderdata})
    } catch (err) {
        console.log("error for loading order list ",err)
        return res.status(500).render("404",{message:"unable to complate your request"})
    }
}



module.exports = {
    load_orderlist
}