const User = require("../models/user_models")

const is_authaticated = async (req,res,next)=>{
    if (req.session.user_id){
        const user = await User.findById(req.session.user_id);
        if(user.is_active){
            next();
        }else{
            // req.session.destroy()
            res.redirect("/login")
        }
    }else{
        res.redirect("/login")
    }
}

// check the the user is alredy logined

const is_alredylogined = async (req,res,next)=>{
    if (req.session.user_id){
        res.redirect("/load_home")
    }else{
        next()
    }
}

module.exports = {
    is_authaticated,
    is_alredylogined
} 