const Cart = require("../models/cart"); 
const Product = require("../models/product"); 
const Category = require("../models/category");




const validateCartPrices = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const cart = await Cart.findOne({ user: userId }).populate("items.productId");

    let updated = false;
    const today = new Date().toISOString();

    for (let item of cart.items) {
      const product = await Product.findById(item.productId);

      if (product) {
        const category = await Category.findById(product.category);
        const productSize = product.sizes.find(size => size.size === item.size);

        console.log("This is the category of cart items:", category);
        console.log("Find the product size:", productSize);

        if (productSize) {
          let discountMultiplier = 1;
          let applicableOffers = [];

          if (
            product.productOffer &&
            product.productOffer.offerStatus &&
            today >= new Date(product.productOffer.offerStartDate).toISOString() &&
            today <= new Date(product.productOffer.offerExpiryDate).toISOString()
          ) {
            applicableOffers.push({
              type: 'product',
              discountPercentage: product.productOffer.offerDiscountPercentage
            });
          }

          if (
            category &&
            category.categoryoffer &&
            category.categoryoffer.offerStatus &&
            today >= new Date(category.categoryoffer.offerStartDate).toISOString() &&
            today <= new Date(category.categoryoffer.offerExpiryDate).toISOString()
          ) {
            applicableOffers.push({
              type: 'category',
              discountPercentage: category.categoryoffer.offerDiscountPercentage
            });
          }

          console.log("This is the array of applicable offers:", applicableOffers);

          if (applicableOffers.length > 0) {
            const maxDiscountOffer = applicableOffers.reduce((max, offer) =>
              offer.discountPercentage > max.discountPercentage ? offer : max
            );

            discountMultiplier = (100 - maxDiscountOffer.discountPercentage) / 100;
          }

          const bestPriceAfterOffer = productSize.Actualprice * discountMultiplier;

          if (item.priceafteroffer !== Math.round(bestPriceAfterOffer) || item.stock !== productSize.stock) {
            item.priceafteroffer = Math.round(bestPriceAfterOffer);
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
    console.error("Error validating cart prices:", error);
    res.status(500).json({ message: "Error validating cart prices" });
  }
};

module.exports = validateCartPrices;

