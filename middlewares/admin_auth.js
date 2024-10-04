

const is_authaticated = (req,res,next)=>{
    if(req.session.admin_id){
        return next()
    }
    res.redirect("/admin")
};

module.exports = {
    is_authaticated
}



