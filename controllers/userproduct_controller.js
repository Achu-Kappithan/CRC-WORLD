


const load_productview = async (req,res)=>{
    try {
        res.render("productview")
        
    } catch (err) {
        console.log("err")
        
    }
}




module.exports = {
    load_productview
}