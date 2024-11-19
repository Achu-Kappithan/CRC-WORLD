
const Order = require("../models/order")


function getdaterange(period) {
    let startdate;
    const currentdate = new Date();

    if (period === "daily") {
        startdate = new Date(currentdate);
        startdate.setHours(0, 0, 0, 0); 
    } else if (period === "weekly") {
        startdate = new Date(currentdate);
        startdate.setDate(currentdate.getDate() - 7);
    } else if (period === "monthly") {
        startdate = new Date(currentdate.getFullYear(), currentdate.getMonth(), 1);
    } else if (period === "yearly") {
        startdate = new Date(currentdate.getFullYear(), 0, 1);
    } else {
        throw new Error("Invalid period specified.");
    }

    return { startdate, enddate: currentdate };
}

// for generating the report

async function generate_salesreport(startDate, endDate) {
    console.log("dates is ",startDate,  "asdfg",endDate)

    return await Order.aggregate([
        
        {
            $match: {
                orderDate: { $gte: startDate, $lte: endDate },
                status: "Delivered"
            }
        },
    
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                dailySales: { $sum: { $sum: "$items.finalprie" } },
                dailyQuantity: { $sum: { $sum: "$items.quantity" } },
                dailyOrders: { $sum: 1 }, 
                dailyCouponDiscount: { $sum: { $ifNull: ["$coupondiscout", 0] } },
                dailyOfferDiscount: { 
                    $sum: { 
                        $sum: { 
                            $map: { 
                                input: "$items", 
                                as: "item", 
                                in: { $subtract: ["$$item.Salesprice", "$$item.finalprie"] }
                            } 
                        } 
                    }
                }
            }
        },
        
        {
            $sort: { _id: 1 }
        },
    
        {
            $group: {
                _id: null, 
                totalSales: { $sum: "$dailySales" },
                totalQuantity: { $sum: "$dailyQuantity" },
                totalOrders: { $sum: "$dailyOrders" }, 
                totalCouponDiscount: { $sum: "$dailyCouponDiscount" },
                totalOfferDiscount: { $sum: "$dailyOfferDiscount" },
                dailyData: {
                    $push: {
                        date: "$_id",
                        sales: "$dailySales",
                        quantity: "$dailyQuantity",
                        orders: "$dailyOrders",
                        couponDiscount: "$dailyCouponDiscount",
                        offerDiscount: "$dailyOfferDiscount"
                    }
                }
            }
        },

        {
            $project: {
                _id: 0,
                totalSales: 1,
                totalQuantity: 1,
                totalOrders: 1,
                totalCouponDiscount: 1,
                totalOfferDiscount: 1,
                dailyData: 1 
            }
        }
    ]);
}


// for finding topselling products

const top_sellingproducts = async () => {
    const topproduct = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          total_quantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { total_quantity: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productdetails",
        },
      },
      { $unwind: "$productdetails" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$productdetails.productname", 
          totalQuantity: "$total_quantity",
        },
      },
    ]);
  
    return topproduct[0] || null;
  };

  const top_sellingcategory = async () => {
    const top_category = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products", 
          localField: "items.productId",
          foreignField: "_id",
          as: "productdetails",
        },
      },
      { $unwind: "$productdetails" },
      {
        $lookup: {
          from: "categories", 
          localField: "productdetails.category",
          foreignField: "_id",
          as: "categorydetails",
        },
      },
      { $unwind: "$categorydetails" }, 
      {
        $group: {
          _id: "$productdetails.category", 
          categoryName: { $first: "$categorydetails.name" }, 
          totalQuantity: { $sum: "$items.quantity" }, 
        },
      },
      { $sort: { totalQuantity: -1 } }, 
      { $limit: 1 }, 
    ]);
  
    return top_category[0] || null;
  };
  

  //  for finding the top selling brand

  const top_sellingbrand = async () => {
    const top_brand = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products", 
          localField: "items.productId",
          foreignField: "_id",
          as: "productdetails",
        },
      },
      { $unwind: "$productdetails" },
      {
        $lookup: {
          from: "brands", 
          localField: "productdetails.brand",
          foreignField: "_id",
          as: "branddetails",
        },
      },
      { $unwind: "$branddetails" }, 
      {
        $group: {
          _id: "$productdetails.brand", 
          brandName: { $first: "$branddetails.name" }, 
          totalQuantity: { $sum: "$items.quantity" }, 
        },
      },
      { $sort: { totalQuantity: -1 } }, 
      { $limit: 1 },
    ]);
  
    return top_brand[0] || null;
  };
    
    
  // finding final output

  const top_sellingitems = async () => {
    try {
      const topProduct = await top_sellingproducts();
      const topCategory = await top_sellingcategory();
      const topBrand = await top_sellingbrand();
  
      return {
        top_product: topProduct,
        top_category: topCategory,
        top_brand: topBrand,
      };
    } catch (error) {
      console.error("Error generating sales report:", error);
      throw new Error("Failed to generate sales report");
    }
  };
    




module.exports = {
    generate_salesreport,
    getdaterange,
    top_sellingitems
}
