


// load admin login page

const loadadminlogin = async (req,res)=>{
    try {
        res.send("welocme to admin login page")
    } catch (err) {
        console.log(err)
        
    }
}

module.exports = {
    loadadminlogin
}