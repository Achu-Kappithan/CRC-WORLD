const Admin = require("../models/user_models")
const bcrypt = require("bcrypt")
require("dotenv").config


// load admin login page

const load_adminlogin = async (req,res)=>{
    try {
        res.render("admin_login")
    } catch (err) {
        console.log(err)
        
    }
}

// load admin dshbord 

const load_dashbord = async (req,res)=>{
    try {
     res.render("admin_dashbord")
    } catch (err) {
        console.log(err)
    }
}


// Admin verification

const admin_verify = async (req,res)=>{
    try {
        const email = req.body.admin_email
        const password = req.body.admin_password
        const admindata = await  Admin.findOne({email : email})
        

        if(admindata){
            const passmatch =  await bcrypt.compare(password,admindata.password)
            if(passmatch){
                if(admindata.is_admin==0){
                    req.flash('error',"SORRY ADMIN CAN ONLY LOGIN")
                    return res.redirect("/admin")
                }else{
                    req.session.admin_id =admindata._id
                    return res.redirect("/dashbord")
                }
            }else{
                req.flash("error","EMAIL OR PASSWORD IS INCORRECT")
                return res.redirect("/admin")
            }

        }else{
            req.flash("error","USER NOT FOUND")
            res.redirect("/admin")
        }

        
    } catch (err) {
        console.log(err);
        
        
    }
}

module.exports = {
    load_adminlogin,
    load_dashbord,
    admin_verify
}