const express = require("express")
const admin_route = express()
const path = require("path")
const bodyparser = require("body-parser")
const admin_controller = require("../controllers/admin_controller");


admin_route.use(bodyparser.urlencoded({extended:true}))


admin_route.set("view engine","ejs")
admin_route.set('views',path.join(__dirname,"../views/admin"))

admin_route.get("/admin",admin_controller.load_adminlogin);

admin_route.post("/verify",admin_controller.admin_verify)

admin_route.get("/dashbord",admin_controller.load_dashbord)


module.exports= admin_route;