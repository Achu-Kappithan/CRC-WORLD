



async function applyofferprice(products) {
    const today = new Date();

    for (let product of products) {
        const categoryOffer = product.category.categoryoffer;
        const productOffer = product.productOffer;  

        let discountMultiplier = 1;  

        const isProductOfferValid = productOffer && productOffer.offerStatus &&
                                    today >= new Date(productOffer.offerStartDate) &&
                                    today <= new Date(productOffer.offerExpiryDate);

        const isCategoryOfferValid = categoryOffer && categoryOffer.offerStatus &&
                                     today >= new Date(categoryOffer.offerStartDate) &&
                                     today <= new Date(categoryOffer.offerExpiryDate);

        if (isProductOfferValid && isCategoryOfferValid) {
            discountMultiplier = Math.min(
                (100 - productOffer.offerDiscountPercentage) / 100,
                (100 - categoryOffer.offerDiscountPercentage) / 100
            );
        } else if (isProductOfferValid) {
            discountMultiplier = (100 - productOffer.offerDiscountPercentage) / 100;
        } else if (isCategoryOfferValid) {
            discountMultiplier = (100 - categoryOffer.offerDiscountPercentage) / 100;
        }

        product.sizes = product.sizes.map(size => ({
            ...size.toObject(),
            priceafteroffer: size.Actualprice * discountMultiplier
        }));

        await product.save(); 
    }

    return products;
}

module.exports = { applyofferprice };



