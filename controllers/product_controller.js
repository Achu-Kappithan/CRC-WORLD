const Product = require("../models/product");
const Category = require("../models/category");
const Brand = require("../models/brand");
const { findByIdAndUpdate } = require("../models/otp");
const product = require("../models/product");

// load addproduct page

const loadadd_product = async (req, res) => {
  try {
    const brandlist = await Brand.find();
    const categorylist = await Category.find();
    res.render("addproduct", { brandlist, categorylist });
  } catch (err) {
    console.log(err);
  }
};

/// for adding product to the database

const add_product = async (req, res) => {
  try {
    const { productname, productdis, taxrate, productcategory, productbrand } =
      req.body;
    const exsitingproduct = await product.findOne({ productname: productname });
    // console.log("this is the data for check product is exist",product)

    if (exsitingproduct) {
      req.flash("error", "Product alredy exist Tray with another product");
      res.status(409).redirect("/lodadadd_product");
    }

    if (!req.files || req.files.length === 0) {
      req.flash("error", "No files were uploaded");
      return res.status(401).redirect("/lodadadd_product");
    }
    const productImages = req.files.map((file) => file.filename);

    const sizes = [];

    if (req.body.size?.SM) {
      sizes.push({
        size: "small",
        stock: req.body.size.SM.stock || 0,
        Salesprice: req.body.size.SM.salesPrice || 0,
        Actualprice: req.body.size.SM.actualPrice || 0,
      });
    }

    if (req.body.size?.Medium) {
      sizes.push({
        size: "Medium",
        stock: req.body.size.Medium.stock || 0,
        Salesprice: req.body.size.Medium.salesPrice || 0,
        Actualprice: req.body.size.Medium.actualPrice || 0,
      });
    }

    if (req.body.size?.L) {
      sizes.push({
        size: "Large",
        stock: req.body.size.L.stock || 0,
        Salesprice: req.body.size.L.salesPrice || 0,
        Actualprice: req.body.size.L.actualPrice || 0,
      });
    }

    const productDetails = new Product({
      productname: productname,
      productdescription: productdis,
      category: productcategory,
      brand: productbrand,
      Taxrate: taxrate,
      sizes: sizes,
      productimage: productImages,
    });

    await productDetails.save();
    req.flash("success", "Product added successfully");
    res.redirect("/lodadadd_product");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error adding product: ", err);
    res
      .status(404)
      .render("404", { message: "unable to addproduct  plz tray again " });
  }
};

// for loading product list page

const product_list = async (req, res) => {
  try {
    const productlist = await Product.find();

    return res.status(200).render("productlist", { productlist });
  } catch (err) {
    console.log("error for displaying product list", err);
    res
      .status(500)
      .render("404", { message: "Unable to dispaly the product list" });
  }
};

// for loading product edt page

const loadedit_product = async (req, res) => {
  try {
    const id = req.query.id;
    const brandlist = await Brand.find();
    const categorylist = await Category.find();
    const productdata = await Product.findById({ _id: id })
      .populate("brand")
      .populate("category");
    // console.log("this is data for editing ",productdata)
    return res
      .status(200)
      .render("edit_product", { productdata, brandlist, categorylist });
  } catch (err) {
    console.log("error for loding edit product page", err);
    res
      .status(500)
      .render("404", { message: "unable to load product edit page" });
  }
};

// for updating products

const update_product = async (req, res) => {
  try {
    const id = req.query.id;
    const {
      productname,
      productdis,
      taxrate,
      productcategory,
      productbrand,
      size,
    } = req.body;

    const sizes = [];

    if (size.SM) {
      sizes.push({
        size: "small",
        stock: size.SM.stock || 0,
        Actualprice: size.SM.actualPrice || 0,
        Salesprice: size.SM.salesPrice || 0,
      });
    }

    if (size.Medium) {
      sizes.push({
        size: "Medium",
        stock: size.Medium.stock || 0,
        Actualprice: size.Medium.actualPrice || 0,
        Salesprice: size.Medium.salesPrice || 0,
      });
    }

    if (size.L) {
      sizes.push({
        size: "Large",
        stock: size.L.stock || 0,
        Actualprice: size.L.actualPrice || 0,
        Salesprice: size.L.salesPrice || 0,
      });
    }

    const updateData = {
      productname,
      productdescription: productdis,
      category: productcategory,
      brand: productbrand,
      Taxrate: taxrate,
      sizes: sizes,
    };

    if (req.files && req.files.length > 0) {
      const productImages = req.files.map((file) => file.filename);
      updateData.productimage = productImages;
    }

    const updateproduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updateproduct) {
      req.flash("error", "Product not found");
      return res.status(404).redirect("/edit_product");
    }

    req.flash("success", "Product updated successfully");
    return res.status(200).redirect("/admin_productlist");
  } catch (err) {
    console.error("error for updating the product", err);
    return response
      .status(500)  
      .render("404", {
        message: "Unable to complate your request tray again..!",
      });
  }
};

// for listing and unlisting the products

const unlist_product = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await product.findOne({ _id: id });
    console.log("this is the data for unlist product", data);

    if (data.is_deleted == false) {
      await product.findByIdAndUpdate(id, { is_deleted: true });
      req.flash("success", "Product unlisted sucessfully");
      return res.status(200).redirect("/admin_productlist");
    } else {
      await product.findByIdAndUpdate(id, { is_deleted: false });
      req.flash("success", "Product unlisted sucessfully");
      return res.status(200).redirect("/admin_productlist");
    }
  } catch (err) {
    console.log("error for list or unlist the product", err);
    return res
      .status(500)
      .render("404", { message: "Sorry Unable to  complate your request" });
  }
};

module.exports = {
  loadadd_product,
  add_product,
  product_list,
  loadedit_product,
  update_product,
  unlist_product,
};
