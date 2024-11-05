const product = require("../models/product");
const brand = require("../models/brand");
const category = require("../models/category");
const { price: priceHelper } = require("../utils/pricehelper");
const { applyofferprice } = require("../utils/offeruils")
const Wishlist = require("../models/wishlist");

// for loading product view page
const load_productview = async (req, res) => {
  try {
    const size = "size";
    const id = req.query.id;
    let productdata = await product.findOne({ _id: id });
    console.log("productdata",productdata)


    let relatedproducts = await product.find({
      $or:[{category:productdata.category},
        {brand:productdata.brand}]});

    // console.log("related productdata ",relatedproducts)
    return res.render("productview", { productdata, priceHelper ,relatedproducts });
  } catch (err) {
    console.log("error for loading product view page",err);
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
    console.error("error fetching size details:", err);
    res.json({ success: false, message: "Error fetching size details" });
  }
};

// for loading shop page

const load_shop = async (req, res) => {
  try {
    const message = req.flash("message");
    const type = req.flash("type");
    const userid = req.session.user_id;

    const wishlistdata = await Wishlist.findOne({userId:userid})
    const branddata = await brand.find({ is_deleted: false });
    const catdata = await category.find({ is_deleted: false });
    let productdata = await product.find({is_deleted: false})
      .populate("brand")
      .populate("category");
      productdata = await applyofferprice(productdata)

      
    return res.render("usershop", {
      productdata,
      branddata,
      catdata,
      priceHelper,
      message,
      type,
      wishlist :wishlistdata
    });
  } catch (err) {
    console.log(err);
    res.status(500).render("user404",{maessage:"Unable load shop-page Try again..!"});
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
          sortOption["sizes.0.priceafteroffer"] = 1;
        } else if (sort === "price-desc") {
          sortOption["sizes.0.priceafteroffer"] = -1;
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
    products = await applyofferprice(products)

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
