

const is_authaticated = (req,res,next)=>{
    if(req.session.admin_id){
        return next()
    }
    req.session.destroy()
    res.redirect("/admin")
};

const is_alredylogedin = (req,res,next)=>{
    if(req.session.admin_id){
        res.redirect("/admin_home")
    }
    next()
}

module.exports = {
    is_authaticated,
    is_alredylogedin
}



