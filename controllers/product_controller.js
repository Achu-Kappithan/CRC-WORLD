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
    console.log("error for loading addproduct page", err);
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
      return res.status(409).redirect("/lodadadd_product");
    }

    if (!productcategory && !productbrand) {
      req.flash("error", "Plz select category and brand");
      return res.status(409).redirect("/lodadadd_product");
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
    const message = req.flash("message");
    const type =  req.flash("type");
    const page = req.query.page || 1;
    const limit = 4;

    const productlist = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const toataorders = await Product.countDocuments();
    const totalPages = Math.ceil(toataorders / limit);

    return res
      .status(200)
      .render("productlist", { productlist, totalPages, page , message ,type});
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
    const message = req.flash("message");
    const type =  req.flash("type");

    const id = req.query.id;
    const brandlist = await Brand.find();
    const categorylist = await Category.find();
    const productdata = await Product.findById({ _id: id })
      .populate("brand")
      .populate("category");
    // console.log("this is data for editing ",productdata)
    return res
      .status(200)
      .render("edit_product", { productdata, brandlist, categorylist ,message ,type });
  } catch (err) {
    console.log("error for loding edit product page", err);
    res
      .status(500)
      .render("404", { message: "unable to load product edit page" });
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
      req.flash("message", "Product unlisted sucessfully");
      req.flash("type","success")
      return res.status(200).redirect("/admin_productlist");
    } else {
      await product.findByIdAndUpdate(id, { is_deleted: false });
      req.flash("message", "Product listed sucessfully");
      req.flash("type","success")
      return res.status(200).redirect("/admin_productlist");
    }
  } catch (err) {
    console.log("error for list or unlist the product", err);
    return res
      .status(500)
      .render("404", { message: "Sorry Unable to  complate your request" });
  }
};

// for updating the product

const update_product = async (req, res) => {
  try {
    let existingImages = [];
    try {
      existingImages = req.body.existingImages
        ? JSON.parse(req.body.existingImages)
        : [];
    } catch (err) {
      console.log("Error parsing existingImages:", err);
      existingImages = [];
    }

    const { productname, productdis, taxrate, productcategory, productbrand } =
      req.body;

    const productId = req.query.pid;
    const existingdata = await Product.findById(productId);
    const namematch = await Product.findOne({ productname: productname });

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

    if (req.body.size.L) {
      sizes.push({
        size: "Large",
        stock: req.body.size.L.stock || 0,
        Salesprice: req.body.size.L.salesPrice || 0,
        Actualprice: req.body.size.L.actualPrice || 0,
      });
    }

    let productimage = existingdata.productimage;

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const index = existingImages.indexOf(file.originalname);
        if (index !== -1) {
          productimage[index] = file.filename;
        } else {
          productimage.push(file.filename);
        }
      });
    }

    const updatedata = {
      productname: productname,
      productdescription: productdis,
      category: productcategory,
      brand: productbrand,
      Taxrate: taxrate,
      sizes: sizes,
      productimage: productimage,
    };

    if (existingdata.productname == productname) {
      await Product.findByIdAndUpdate(
        productId,
        { $set: updatedata },
        { new: true }
      );
      req.flash("message", "Product updated successfully");
      req.flash("type","success")
      return res.status(200).redirect("/admin_productlist");
    } else if (!namematch) {
      await Product.findByIdAndUpdate(
        productId,
        { $set: updatedata },
        { new: true }
      );
      req.flash("message", "Product updated successfully");
      req.flash("type","success")
      return res.status(200).redirect("/admin_productlist");
    } else {
      req.flash("message", "Product name already exisits");
      req.flash("type","warning")
      res.status(500).redirect("/admin_productlist");
    }
  } catch (err) {
    console.log("this is the error for updating the product", err);
    return res
      .status(500)
      .render("404", { message: "Unable to complate product updation" });
  }
};

// for sorting productlist by status

const admin_productsort = async (req, res) => {
  try {
    const sortdata = req.body.sort;
    let productlist;

    if (sortdata == "all") {
      productlist = await Product.find();
      return res.json({ success: true, productlist });
    } else productlist = await Product.find({ is_deleted: sortdata });
    return res.json({ success: true, productlist });
  } catch (err) {
    console.log("error for product sort by status", err);
    return res
      .status(500)
      .render("404", { message: "Unable to complate request" });
  }
};

module.exports = {
  loadadd_product,
  add_product,
  product_list,
  loadedit_product,
  update_product,
  unlist_product,
  admin_productsort,
};
