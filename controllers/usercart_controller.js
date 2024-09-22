const Cart = require("../models/cart");
const Product = require("../models/product");

const load_cart = async (req,res)=>{
    try {
        res.render("cart")
        
    } catch (err) {
        console.log(err)
        
    }
}

const  addto_cart = async (req,res)=>{
    try {
        // // const userid = req.session.user_id
        // if (!userid) {
        //     return res.status(401).send("User not authenticated");
        // }
        // const productid = req.body.productId

        // console.log("this is the product id ",productid)
        // console.log("this is authoticted userid",userid)

        res.send ("welcoeme")

    } catch (err) {
        console.log(err)
        
    }
}





module.exports= {
    load_cart,
    addto_cart

}