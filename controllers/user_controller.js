

const User = require("../models/user_models")
const bcrypt = require("bcrypt")

//for loading sign in page
const loadlogin =  (req,res)=>{
    try {
        res.render("login",{ message: null});

    } catch (err) {
        console.log(err)
    }
} 

//for loding sign up page

const loadsignup =(req,res)=>{
    try {
        res.render("register",{ message: null});
    } catch (err) {
       console.log(err) 
    }
}


// encrypt password

const encryptpass = async (password)=>{
    try {
        const hashpass = await bcrypt.hash(password,10);
        console.log(hashpass)
        return hashpass
    } catch (err) {
      console.log(err)  
    }
}


// for register new user

const signup_user = async (req,res)=> {
    try {
        console.log(`PASSWORD IS ${req.body.password}`)
        const spass = await encryptpass(req.body.password)
        const userexist = await User.findOne({email : req.body.email})
        if(userexist){
            res.render("register",{message: "USER ALREDAY EXISTS"})
        }

        const user = new User({
            firstname:req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: spass,
            is_admin:0
        });
        const userdata = await user.save();
        if(userdata){
            res.render("login",{ message: "SUCESSFULLY REGISTERED!" })
        }else{
            res.render("register",{ message: "SOMETHING WENT TO WORNG!" })
            console.log("user not registered")
        }
    } catch (err) {
        res.render("register",{ message: "ENTER VALID CREDENTIALS!" })
        console.log(err)
        
    }
}


module.exports ={
    loadlogin,
    loadsignup,
    signup_user
}