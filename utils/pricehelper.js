exports.getAvailablePrice = function(sizes) {
    for (const size of sizes) {
      if (size.stock > 0) {
        return size.Salesprice;
      }
    }
    return null;
  };
  
  exports.formatPrice = function(price) {
    return price 
      ? price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) 
      : 'Unavailable';
  };