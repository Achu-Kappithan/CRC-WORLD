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
        const productid = req.query.id;
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
            req.flash("message","Product add to wishlist")
            req.flash("type","success")
            return res.status(200).redirect("/user_shop")

        }else{
            await Wishlist.findOneAndUpdate(
                {userId:userid},
                {$push:{productIds:productid}
            })
            req.flash("message","Product add to wishlist")
            req.flash("type","success")
            return res.status(200).redirect("/user_shop")
        }
    } catch (err) {
        console.log("error for product addto wishlist",err)
        return res.status(500).render("user404",{message:"Unable to complate your request"})
    }
}

// for remove product from the wishlist

const remove_wishlistitem = async (req,res)=>{
    try {
        const itemId = req.body.itemid.trim()
        console.log("itemid",itemId)
        const userid = req.session.user_id;

        if(!userid){
            req.flash("message","User not Authenticated");
            req.flash("type","warning")
            return res.status(400).redirect("/load_home")
        }
        const removeditem = await Wishlist.findOneAndUpdate(
            {userId:userid},
            {$pull:{productIds:itemId}},
            {new:true}
        );
        if(!removeditem){
            req.flash("message","Failed to remove the procuct")
            req.flash("type","error")
            return res.status(400).redirect("/load_wishlist")
        }
        req.flash("message","item removed successfully..")
        req.flash("type","success")
        return res.status(200).redirect("/load_wishlist")
        

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