const product = require("../models/product");
const brand = require("../models/brand");
const category = require("../models/category");
const priceHelper = require("../utils/pricehelper");

// for loading product view page
const load_productview = async (req, res) => {
  try {
    const size = "size";
    const id = req.query.id;
    const productdata = await product.findOne({ _id: id });
    return res.render("productview", { productdata, helpers: priceHelper });
  } catch (err) {
    console.log(err);
  }
};

const load_sizesort = async (req, res) => {
  try {
    const sizeId = req.query.id;

    // Find the product that contains the size with the provided size ID
    const sizeproduct = await product.findOne(
      { "sizes._id": sizeId },
      { "sizes.$": 1 }
    );

    if (sizeproduct && sizeproduct.sizes.length > 0) {
      res.json({ success: true, size: sizeproduct.sizes[0] });
    } else {
      res.json({ success: false, message: "Size not found" });
    }
  } catch (err) {
    console.error("Error fetching size details:", err);
    res.json({ success: false, message: "Error fetching size details" });
  }
};

// for loading shop page

const load_shop = async (req, res) => {
  try {
    const message = req.flash("message");
    const type = req.flash("type");

    const branddata = await brand.find({ is_deleted: false });
    const catdata = await category.find({ is_deleted: false });
    const productdata = await product.find({is_deleted: false})
      .populate("brand")
      .populate("category");
      
    return res.render("usershop", {
      productdata,
      branddata,
      catdata,
      helpers: priceHelper,
      message,
      type
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

// filter productss
const filterProducts = async (req, res) => {
  try {
    const { categories = [], brands = [], sort = [], search } = req.body;

    // console.log("this is the data", categories, brands,sort);

    let query = { is_deleted:false };
    
    if (categories.length > 0) {
      query.category = { $in: categories };
    }
    if (brands.length > 0) {
      query.brand = { $in: brands };
    }
    if(search&& search.trim()){
      query.productname = { $regex: new RegExp(search, 'i') };
    }

    let sortOption = {};
    if (sort.length > 0) {
      sort.forEach((sort) => {
        if (sort === "price-asc") {
          sortOption["sizes.0.Salesprice"] = 1;
        } else if (sort === "price-desc") {
          sortOption["sizes.0.Salesprice"] = -1;
        } else if (sort === "alpha-asc") {
          sortOption["productname"] = 1;
        } else if (sort === "alpha-desc") {
          sortOption["productname"] = -1;
        }
      });
    }

    // console.log("this is filter query", query);
    // console.log("this is  sortoption", sortOption);

    let products = await product
      .find(query)
      .sort(sortOption)
      .populate("brand")
      .populate("category");

    console.log("this is productfilter data", products);

    return res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
};

module.exports = {
  load_productview,
  load_sizesort,

  // shope page
  load_shop,
  filterProducts,
};
