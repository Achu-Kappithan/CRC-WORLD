
const price = function(size) {
  let finalprice = 0;

  for (let value of size) {
    if (value.priceafteroffer !== undefined && value.priceafteroffer > 0) {
      finalprice = value.priceafteroffer;
    } else if (value.Actualprice > 0) {
      finalprice = value.Actualprice;
    }

    if (finalprice > 0) {
      return Math.round(finalprice);
    }
  }

  return "Unavailable";
};


module.exports = {price};