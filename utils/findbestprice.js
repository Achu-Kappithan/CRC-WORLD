const Category = require("../models/category"); 


const findbestoffer = async (product) => {
    const today = new Date();
    const category = await Category.findById(product.category); 

    for (let size of product.sizes) {
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

        size.priceafteroffer = size.Actualprice * discountMultiplier;
    }

    await product.save(); 
};

module.exports = { findbestoffer };
