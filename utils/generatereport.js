
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

module.exports = {
    generate_salesreport,
    getdaterange
}
