const Category = require("../models/category");
const { findByIdAndUpdate } = require("../models/otp");
const product = require("../models/product");
const { findById } = require("../models/user_models");
const {findbestoffer} = require("../utils/findbestprice")

// for loading offerlist page

const load_offerlist = async (req,res)=>{
    try {
        const message = req.flash("message")
        const type = req.flash("type")
        const category = await Category.find()
        const  productdata = await product.find()
        return res.status(200).render("offerlist",{category, message, type, productdata })
    } catch (err) {
        console.log("error for  loading offerlist page",err);
       return res.status(500).redirect("404"," Can't load offerlist Tray aganin ....!")
    }
}


// for loading add newoffer page

const load_newoffer = async (req,res)=>{
    try {
        const message = req.flash("message")
        const type = req.flash("type")
        const category = await Category.find()
        const products = await product.find()

        console.log("this is the category is send to the offers page",category)
        return res.status(200).render("add_newoffer",{category ,message ,type ,products})
    } catch (err) {
        console.log("error for loading new offer page",err)
        return res.status(500).render("404","Can't load addoffer page Tray aganin ....!")
    }
}

// for update category offer

const add_categoryoffer = async (req,res)=>{
    try {
        const {catofrname, catofrdescription, catofrpercentage, catofrstartdate, catofrenddate, catofrid} = req.body;

        const newoffer = await Category.findByIdAndUpdate(
            { _id:catofrid},
            {categoryoffer :{
                offerName : catofrname,
                offerdiscription : catofrdescription,
                offerDiscountPercentage : catofrpercentage,
                offerStartDate : catofrstartdate,
                offerExpiryDate : catofrenddate
            }},
            {new: true}
        );

        if(!newoffer){
            req.flash("message","Can't complate your request try again...!")
            req.flash("type","error")
           return  res.redirect("/loadcreateoffer")
        }else{
            // const productdata = await product.find({category : catofrid})

            // for (let item of productdata){
            //     for(let size of item.sizes){
            //         const oferprice = (size.Salesprice*catofrpercentage)/100
            //         size.priceafteroffer = size.Salesprice -oferprice
            //     }
            //     await item.save()
            // }
            // console.log("this data after offer calculation",productdata)


            req.flash("message","Offer successfully added..")
            req.flash("type","success")
            return  res.redirect("/loadcreateoffer")

        }
    } catch (err) {
        console.log("error for addnew category offer",err)
        return res.status(500).render("404","Can't complete your request..!")
        
    }
}

// for remve category offers

const remove_catoffer = async (req,res)=>{
    try {
        const catid = req.query.id ;
        console.log("catid for remove the offer",catid)

         await Category.findByIdAndUpdate(
            { _id: catid },
            { $unset: { categoryoffer: "" } },
            { new: true }
        );
       const productdata=  await product.find({category :catid})

       for(let product of productdata){
        for(let item of product.sizes){
            item.priceafteroffer = 0
        }
        await product.save()
       }
       
        return res.json({success:true,message:"Offer removed successfully"})
    } catch (err) {
        console.log("error for remove the catoffer",err)
        return res.render("404",{message: "Unable to complate your request plz try again...!"})
    }
}


// for loading  category edit page

const load_editcatoffer = async (req,res)=>{
    try {
        const message = req.flash("message")
        const type = req.flash("type")
        const id = req.query.id;
        const catdata = await Category.findById({_id:id})
        return res.status(200).render("catofferedit",{catdata, type, message})
        
    } catch (err) {
        console.log("error for loading categoryoffer editing page",err);
        return res.status(500).render("404",{message: "Unable to complete request try again...!"})
    }
}

// for update category offer details  

const update_catoffer = async (req,res)=>{
    try {
        const id = req.query.id
        const {catofrname, catofrdescription, catofrpercentage, catofrenddate} = req.body 

        const updateddata = await Category.findByIdAndUpdate(
            {_id:id},
            {$set:{"categoryoffer.offerName" : catofrname,
                    "categoryoffer.offerdiscription": catofrdescription ,
                    "categoryoffer.offerDiscountPercentage": catofrpercentage ,
                    "categoryoffer.offerExpiryDate" : catofrenddate}},
            {new:true})

            let productdata = await product.findOne({category:id })

            for (let item of productdata.sizes){
                offerprice = (item.Salesprice*catofrpercentage)/100
                item.priceafteroffer =  item.Salesprice - offerprice
            }
             const updateddatat= await productdata.save()
             console.log("updateddata",updateddata)

            if(!updateddatat){
                req.flash("message","Can't update the offer..")
                req.flash("type","error")
                return res.status(200).redirect("/load_offerlist")
            }
            req.flash("message","Offer successfully Updated..")
            req.flash("type","success")
            return res.status(200).redirect("/load_offerlist")
    } catch (err) {
        console.log("error for update category offer",err)
        return res.status(500).render("404",{message: "Can't Update Offer try again...!"})
        
    }
}

// for adding product offer

const add_productoffer = async (req, res) => {
    try {
        const { pro_ofr_name, pro_ofr_discription, offer_products, pro_ofr_discount, Pro_ofr_strdate, Pro_ofr_expdate } = req.body;

        const productoffer = await product.findByIdAndUpdate(
            { _id: offer_products },
            {
                productOffer: { 
                    offerName: pro_ofr_name,
                    offerDiscountPercentage: pro_ofr_discount,
                    offerStartDate: Pro_ofr_strdate,
                    offerExpiryDate: Pro_ofr_expdate,
                    offerdiscription: pro_ofr_discription,
                    offerStatus: true
                }
            },
            { new: true }
        );
        const proctdata = await product.findById(offer_products); 
        await findbestoffer(proctdata);

        req.flash("message", "Product offer added successfully");
        req.flash("type", "success");
        return res.status(200).redirect("/load_offerlist");

    } catch (err) {
        console.error("error for adding product offer", err);
        return res.status(500).render("404", { message: "Unable to complete your request" });
    }
};


//  for loading  productoffer edit page

const load_editProductoffer = async (req,res)=>{
    try {
        const id = req.query.id
        const message = req.flash("message")
        const type = req.flash("type")
        const produtdata = await product.findById({_id:id})
        return res.status(500).render("productofferedit",{produtdata, message, type})
        
    } catch (err) {
        console.log("error for loading editproduct offer ",err)
        return res.status(500).render("404",{message: "Can't load this page Try again..!"})
    }
}


// for update changes  product offer

const update_productoffer = async (req,res)=>{
    try {
        const id = req.query.id;
        console.log("id form the querey",id)
        const {ofrname ,ofrdescription ,ofrpercentage ,ofrenddate }= req.body

        const updateddata = await product.findByIdAndUpdate(
            {_id:id},
            {$set:{
                "productOffer.offerName" : ofrname,
                "productOffer.offerdiscription" : ofrdescription,
                "productOffer.offerDiscountPercentage" : ofrpercentage,
                "productOffer.offerExpiryDate" : ofrenddate,
            }},
            {new:true}
        )
        console.log("updateddata",updateddata)
        if(!updateddata){
        req.flash("message","Unable to update try again..!")
        req.flash("type","error")
        return res.status(200).redirect("/load_offerlist")
        }
        const produtdata =  await product.findById({_id:id})
        await findbestoffer(produtdata)

        req.flash("message","Offer Updated successfully")
        req.flash("type","success")
        return res.status(200).redirect("/load_offerlist")
    } catch (err) {
        console.log("error update the productoffer changes ",err)
        return res.status(500).render("404",{message: " Unable to complete the request..!"})
        
    }
}

// for removeing  product offer  form the list 

const remove_productoffer = async (req, res)=>{
    try {
        const id = req.query.id;

    await product.findByIdAndUpdate(
        {_id:id},
        {$unset:{productOffer : ""}},
        {new : true}
    )
    const produtdata =  await product.findById({_id:id})
        await findbestoffer(produtdata)

        req.flash("message","Offer removed successfully")
        req.flash("type","success")
        return res.status(200).redirect("/load_offerlist")
        
    } catch (err) {
        console.log("error for removing prouct offer",err);
        return res.status(500).render("404",{message: "Unable to complate the reqeust try again...!"})
        
    }
}

// forloading coupon list 

const load_couponlist = async(req,res)=>{
    try {
        res.status(200).render("couponslist")
        
    } catch (err) {
        console.log("error for loading coupon list page",err)
        return res.status(500).render("404",{message: "Can't load coupon page try again....!"})
        
    }
}


module.exports ={
    load_offerlist,
    load_newoffer,
    add_categoryoffer,
    remove_catoffer,
    load_editcatoffer,
    update_catoffer,
    add_productoffer,
    load_editProductoffer,
    update_productoffer,
    remove_productoffer,

    // coupons 
    
    load_couponlist

}