
const {generate_salesreport,top_sellingitems,getdaterange}= require("../utils/generatereport")

const load_customreport = async (req,res)=>{
    try {
        const {startdate ,enddate} = req.body;
        console.log("date is",req.body)
        const startDate = new Date(startdate);
        const endDate = new Date(enddate);
        const report = await generate_salesreport(startDate, endDate);
        const topSellings = await top_sellingitems()
        return res.status(200).render("admin_home", { report, period: "custome",topSellings });
    } catch (err) {
        console.log("error for loading report  page",err)
        res.render("404",{message:"Unable to complete tehe request"});
    }
}

module.exports ={
    load_customreport
}