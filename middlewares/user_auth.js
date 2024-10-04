const User = require("../models/user_models")

const is_authaticated = async (req,res,next)=>{
    if (req.session.user_id){
        const user = await User.findById(req.session.user_id);
        if(user.is_active){
            next();
        }else{
            req.session.destroy()
            res.redirect("/login")
        }
    }else{
        res.redirect("/login")
    }
}

module.exports = is_authaticated