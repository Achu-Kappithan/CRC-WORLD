const Wishlist = require("../models/wishlist")



//load wishlist page

const load_whishlist = async (req,res)=>{
    try {
        const userid = req.session.user_id;
        const wishlistdata = await Wishlist.findOne({userId: userid}).populate("productIds").exec()
    
        const message = req.flash("message")
        const type = req.flash("type")
        res.status(200).render("wishlist",{message ,type ,
            wishlist: wishlistdata ? wishlistdata.productIds : []})
    } catch (err) {
        console.log("error for loading wishlist page",err)
        res.status(500).render("user404",{message:"Unable to load wishlist page"})
    }
}

//  adding product to wishlist

const addto_wishlist = async(req,res)=>{
    try {
        const productid = req.body.id;
        const userid = req.session.user_id;

        if(!userid){
            req.flash("messsage","user is not authoticated");
            return res.status(400).redirect("/user_shop");
        }
        const wishlistdata = await Wishlist.findOne({userId:userid})
        let products = []
        products.push(productid)

        if(!wishlistdata){
          let  wishlist = new Wishlist({
            userId : userid,
            productIds : products,
            });
            
            await wishlist.save()
            res.json({success:true})

        }else{
            const exisistitem = wishlistdata.productIds.find(item=>{
                if(item.toString()===productid.toString()){
                    return true;
                }
            })
            if(exisistitem){
                res.json({error :"Item alredy in the wishlist"})
        }else{
            await Wishlist.findOneAndUpdate(
                {userId:userid},
                {$push:{productIds:productid}
            })
            res.json({success:true})
        }
        }
    } catch (err) {
        console.log("error for product addto wishlist",err)
    }
}

// for remove product from the wishlist

const remove_wishlistitem = async (req,res)=>{
    try {
        const itemId = req.body.id
        console.log("itemid",itemId)
        const userid = req.session.user_id;

        if(!userid){
           return res.json({success:false, message :"User is not Authaticated"})
        }
        const removeditem = await Wishlist.findOneAndUpdate(
            {userId:userid},
            {$pull:{productIds:itemId}},
            {new:true}
        );
        if(!removeditem){
            req.flash("message","Failed to remove the procuct")
            req.flash("type","error")
            return res.json({success:false, message:"Failed to remove the procuct"})
        }
        return res.json({success:true, message:"item removed successfully.."})
        

    } catch (err) {
        console.log("error for removeing wishlist item",err)
        res.status(500).render("user404",{message:"Unable to complate your request Try again...!"})
    }
}

module.exports={
    load_whishlist,
    addto_wishlist,
    remove_wishlistitem
}