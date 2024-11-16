
const {generate_salesreport,getdaterange}= require("../utils/generatereport")

const load_customreport = async (req,res)=>{
    try {
        const {startdate ,enddate} = req.body;
        console.log("date is",req.body)
        const startDate = new Date(startdate);
        const endDate = new Date(enddate);
        const report = await generate_salesreport(startDate, endDate);
        return res.status(200).render("admin_home", { report, period: "custome" });
    } catch (err) {
        console.log("error for loading report  page",err)
        res.redirect("/admin_home");
    }
}

module.exports ={
    load_customreport
}