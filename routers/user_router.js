const express = require("express")
const user_route = express()
const path = require("path")
const bodyparser =require("body-parser")
const user_controller = require("../controllers/user_controller")

user_route.use(bodyparser.urlencoded({ extended: true }));


user_route.set("view engine","ejs")
user_route.set('views',path.join(__dirname,"../views/users"))

user_route.get('/',user_controller.loadlogin)

user_route.get("/register",user_controller.loadsignup)

user_route.post("/signup",user_controller.signup_user)



module.exports = user_route;