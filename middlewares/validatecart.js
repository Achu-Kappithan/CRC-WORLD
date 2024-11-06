const Cart = require("../models/cart"); 
const Product = require("../models/product"); 
const Category = require("../models/category");


const validateCartPrices = async (req, res, next) => {
  try {
    const userId = req.session.user_id; 
    const cart = await Cart.findOne({ user: userId }).populate("items.productId");
    
    let updated = false;
    const today = new Date();

    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      
      if (product) {
        const category = await Category.findById(product.category); 
        const productSize = product.sizes.find(size => size.size === item.size);
        
        if (productSize) {
          const productOffer = product.productOffer;
          const categoryOffer = category?.categoryOffer;

          let discountMultiplier = 1;

          if (
            productOffer &&
            productOffer.offerStatus &&
            today >= new Date(productOffer.offerStartDate) &&
            today <= new Date(productOffer.offerExpiryDate)
          ) {
            discountMultiplier = Math.min(discountMultiplier, (100 - productOffer.offerDiscountPercentage) / 100);
          }

          if (
            categoryOffer &&
            categoryOffer.offerStatus &&
            today >= new Date(categoryOffer.offerStartDate) &&
            today <= new Date(categoryOffer.offerExpiryDate)
          ) {
            discountMultiplier = Math.min(discountMultiplier, (100 - categoryOffer.offerDiscountPercentage) / 100);
          }

          const bestPriceAfterOffer = productSize.Actualprice * discountMultiplier;

          if (item.priceafteroffer !== bestPriceAfterOffer || item.stock !== productSize.stock) {
            item.priceafteroffer = Math.round( bestPriceAfterOffer);
            item.stock = productSize.stock;
            updated = true;
          }
        }
      }
    }

    if (updated) {
      await cart.save(); 
    }

    next(); 
  } catch (error) {
    console.error("error validating cart prices:", error);
    res.status(500).json({ message: "error validating cart prices" });
  }
};

module.exports = validateCartPrices;

