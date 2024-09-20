
const Product = require("../models/product"); // Correct import
const Category = require("../models/category");
const Brand  = require("../models/brand");
const { findByIdAndUpdate } = require("../models/otp");
const product = require("../models/product");


// load addproduct page

const loadadd_product = async (req,res)=>{
    try {
        const brandlist = await Brand.find()
        const categorylist = await Category.find()
        res.render("addproduct",{brandlist,categorylist})
    } catch (err) {
        console.log(err)
        
    }
}


const add_product = async (req, res) => {
    try {
      const { productname, productdis, actualPrice, sellingPrice, taxrate, productcategory, productbrand, productquentity } = req.body;
      console.log(productdis)
      // Check if files were uploaded
      // if (!req.files || req.files.length === 0) {
      //   req.flash("error","No files were uploaded")
      //   res.redirect("/lodadadd_product")
      // }
      if (!req.files || req.files.length === 0) {
        req.flash("error","No files were uploaded")
        return res.redirect("/lodadadd_product")
    }
  
      // const productImages =  req.files.map(file => file.filename); 
      const productImages = req.files.map(file => file.filename);

  
      const productDetails = new Product({
        productname: productname,
        productdescription: productdis,
        category: productcategory,
        brand: productbrand,
        Salesprice: sellingPrice,
        Actualprice: actualPrice,
        Taxrate: taxrate,
        quentity: productquentity,
        productimage: productImages
      });
      console.log(productDetails)
  
      await productDetails.save();
      req.flash("success", "Product added successfully");
      res.redirect("/lodadadd_product");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding product: " + err.message);
      res.redirect("/lodadadd_product");
    }
  };

  // for loading product list page

  const product_list = async (req,res)=>{
    try {
        const productlist = await Product.find()
        
        return res.render("productlist",{productlist})
    } catch (err) {
        console.log(err);
        
        
    }
  }


  // for loading product edt page

  const loadedit_product = async (req,res)=>{

    try {
      const id = req.query.id;
      const brandlist = await Brand.find()
      const categorylist = await Category.find()
      const productdata = await Product.findById({_id:id})
      return res.render("edit_product",{productdata,brandlist,categorylist})
      
    } catch (err) {
      console.log(err)
    }
  }
  
// for updating products

const update_product = async (req,res)=>{
  try {
    const id = req.query.id
    console.log('body id is',id)
    const { productname, productdis, actualPrice, sellingPrice, taxrate, productcategory, productbrand, productquentity } = req.body;

    const updateData = {
      productname: productname,
      productdescription: productdis,
      category: productcategory,
      brand: productbrand,
      Salesprice: sellingPrice,
      Actualprice: actualPrice,
      Taxrate: taxrate,
      quentity: productquentity,

    };

    const productImages =  req.files.map(file => file.filename); 

    if (productImages) {
      updateData.productimage = productImages
    }
    console.log(updateData)


    const updateproduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // This option returns the updated document
    );

    if (!updateproduct) {
      req.flash("error", "Product not found");
      return res.redirect("/edit_product");
    }

    req.flash("success", "Brand updated successfully");
    return res.redirect("/admin_productlist");

  } catch (err) {
    console.error(err);
    req.flash("error", "An error occurred while updating the brand");
    return res.redirect("/edit_product");
  }
};


// for listing and unlisting the products

const unlist_product = async (req,res)=>{
  try {
    const id = req.query.id;
    const data = await product.findOne({_id:id})
    console.log('this is the data for unlist product',data);
    if(data.is_delited== false){
       await product.findByIdAndUpdate(id,{is_delited:true})
       req.flash("success","Product unlisted sucessfully")
       res.redirect("/admin_productlist");
       }else{
        await product.findByIdAndUpdate(id,{is_delited:false})
        req.flash("success","Product unlisted sucessfully")
        res.redirect("/admin_productlist");

    }
  } catch (err) {
    console.log(err)
  }

}









module.exports = {
    loadadd_product,
    add_product,
    product_list,
    loadedit_product,
    update_product,
    unlist_product

}