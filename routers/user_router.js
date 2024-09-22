const express = require("express");
const user_route = express();
const path = require("path");
const bodyparser =require("body-parser");
const user_controller = require("../controllers/user_controller");
const userproduct_controller = require("../controllers/userproduct_controller");
const usercart_controller = require("../controllers/usercart_controller");

user_route.use(bodyparser.urlencoded({ extended: true }));

user_route.set("view engine","ejs")
user_route.set('views',path.join(__dirname,"../views/users"))

//  register a new user
user_route.get("/register",user_controller.loadsignup);
user_route.post("/signup",user_controller.signup_user);
user_route.get("/otp",user_controller.user_send_otp);
user_route.post("/veryfing",user_controller.verify_otp);
user_route.post("/resend_otp",user_controller.resend_otp);

//  user login 
user_route.get("/load_home",user_controller.loadhome);
user_route.post("/user_veryfing",user_controller.userverification);
user_route.get('/login',user_controller.loadlogin);

//reset password
user_route.get("/forgotpassword",user_controller.load_forgotpass);
user_route.post("/resetpass_otp",user_controller.resetpass_mail);
user_route.get('/reset_password/:token',user_controller.reset_password);
user_route.post("/update_password/:token",user_controller.update_password);

//product view page
user_route.get("/load_productview",userproduct_controller.load_productview);

// load shop page
user_route.get("/user_shop",userproduct_controller.load_shop);

// load cart patge
user_route.get("/load_usercart",usercart_controller.load_cart);
user_route.post("/addto_cart",usercart_controller.addto_cart);



module.exports = user_route;