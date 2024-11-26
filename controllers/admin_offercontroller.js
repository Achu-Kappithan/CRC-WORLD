const Category = require("../models/category");
const { findByIdAndUpdate, findByIdAndDelete } = require("../models/otp");
const product = require("../models/product");
const { findById } = require("../models/user_models");
const {findbestoffer} = require("../utils/findbestprice")
const Coupon = require("../models/coupons")

// for loading offerlist page

const load_offerlist = async (req,res)=>{
    try {
        const message = req.flash("message")
        const type = req.flash("type")
        const category = await Category.find()
        const  productdata = await product.find()
        console.log("productdata",productdata)
        const currentdate = Date.now();

        for (const product of productdata) {
            if (product.productOffer) {
                if (product.productOffer.offerExpiryDate <= currentdate) {  
                    product.productOffer.offerStatus = false;
                    await product.save();  
                }
            }
        }  
        
        for(const cate of category){
            if(cate.categoryoffer){
                if(cate.categoryoffer.offerExpiryDate <= currentdate){
                    cate.categoryoffer.offerStatus = false;
                    await cate.save()
                }
            }
        }
        
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
                offerExpiryDate : catofrenddate,
                offerStatus : true
            }},
            {new: true}
        );

        if(!newoffer){
            req.flash("message","Can't complate your request try again...!")
            req.flash("type","error")
           return  res.redirect("/loadcreateoffer")
        }else{
            // const productdata = await product.find({category : catofrid})
            // await findbestoffer(productdata);



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
        console.log("id for update category offer",id)
        const {catofrname, catofrdescription, catofrpercentage, catofrenddate} = req.body 
        console.log("form data here",req.body)

        const offerstatus = await Category.findById({_id:id})
        if(offerstatus.categoryoffer.offerStatus == false){
            req.flash("message","Can't Update Experied offers..")
            req.flash("type","error")
            return res.status(400).redirect("/load_offerlist")
        }

        const updateddata = await Category.findByIdAndUpdate(
            {_id:id},
            {$set:{"categoryoffer.offerName" : catofrname,
                    "categoryoffer.offerdiscription": catofrdescription ,
                    "categoryoffer.offerDiscountPercentage": catofrpercentage ,
                    "categoryoffer.offerExpiryDate" : catofrenddate}},
            {new:true})

            let productdata = await product.findOne({category:id })
            await findbestoffer(productdata)

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

        const productstatus = await product.findById({_id:id})
        if(productstatus.productOffer.offerStatus == false) {
        req.flash("message","Can't edit Experied offer..!")
        req.flash("type","error")
        return res.status(400).redirect("/load_offerlist")
        }

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
        const message = req.flash("message")
        const type = req.flash("type")
        const coupondata = await Coupon.find()
        return res.status(200).render("couponslist",{message,type,coupondata})
        
    } catch (err) {
        console.log("error for loading coupon list page",err)
        return res.status(500).render("404",{message: "Can't load coupon page try again....!"})
    }
}


// for adding new coupon 

const add_coupon = async (req,res)=>{
    try {
        const {couponName, couponDescription, couponCode, couponDiscount, maxAmount, minAmount, userLimit, }= req.body
        
        console.log("addcoupon body ",req.body)

        const coupondata = new Coupon({
            couponName : couponName, 
            couponDescription : couponDescription, 
            couponCode : couponCode, 
            couponDiscount : couponDiscount, 
            maxAmount : maxAmount, 
            minAmount : minAmount, 
            Userlimit : userLimit,
            couponStatus : true 
        })

        await coupondata. save()
        req.flash("message","Coupon added successfully")
        req.flash("type","success")
        res.status(200).redirect("/load_couponlist")
    } catch (err) {
        console.log("error for adding coupons",err)
        return res.status(500).render("404",{message: "Unable to complate your request"})
    }
}

// for loading coupon edit page

const load_editcoupon = async (req,res)=>{
    try {
        const message = req.flash("message")
        const type = req.flash("type")
        const id = req.query.id;
        console.log("this is the idcoupon",id)
        const coupondata = await Coupon.findById({_id:id})
        return res.status(200).render("editcoupons",{coupondata ,message ,type})
        
    } catch (err) {
        console.log("error for loading couponedit page",err)
        return res.status(500).render("404",{message: "Unable to load Coupon edit page try again..!"})
    }
}

// for upload updated coupon data

const update_coupons = async (req,res)=>{
    try {
        const id = req.query.id
        const {couponname, couponsdis, couponcode, couponpercentage, maxamt, minamt, userlimint }= req.body;

        await Coupon.findByIdAndUpdate(
            {_id: id},
            {
                couponName : couponname,
                couponDescription : couponsdis,
                couponCode : couponcode,
                couponDiscount : couponpercentage,
                maxAmount : maxamt,
                minAmount : minamt,
                Userlimit : userlimint,
                couponStatus : true
            }
        );
        req.flash("message","Coupon Updated successfully")
        req.flash("type","success")
        return res.status(200).redirect("/load_couponlist");
        
    } catch (err) {
        console.log("error for uploading coupos edited data",err)
        return res.status(500).render("user404",{message: "Unable to compelate the request"})
    }
}


// for removing  coupons

const remove_coupons = async (req,res)=>{
    try {
        const id = req.query.id;
        await Coupon.findByIdAndDelete ({_id:id})
        req.flash("message","Coupons remove successfully...")
        req.flash("type","success")
        return res.status(500).redirect("/load_couponlist")
        
    } catch (err) {
        console.log("error for removing coupons",err)
        return res.status(500).render("user404",{messsage: "Unable to complete the request try again..!"})
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

    load_couponlist,
    add_coupon,
    load_editcoupon,
    update_coupons,
    remove_coupons

}