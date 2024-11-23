
function Prepotional_couponamt(itemPrice, totalOrderPrice, couponAmount) {
    console.log(`itemprice = ${itemPrice} totalorderprice = ${totalOrderPrice} couponAmount = ${couponAmount}`)
    if (totalOrderPrice <= 0 || couponAmount <= 0) {
        return 0; 
    }
    const proportionalamt = (itemPrice / totalOrderPrice) * couponAmount;
    
    return Math.round(proportionalamt);
}

module.exports ={Prepotional_couponamt}  