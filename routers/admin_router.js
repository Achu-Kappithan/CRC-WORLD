const express = require("express")
const admin_route = express()
const path = require("path")
const bodyparser = require("body-parser")
const admin_controller = require("../controllers/admin_controller");


admin_route.use(bodyparser.urlencoded({extended:true}))


admin_route.set("view engine","ejs")
admin_route.set('views',path.join(__dirname,"../views/admin"))

admin_route.get("/admin",admin_controller.load_adminlogin);

admin_route.post("/verify",admin_controller.admin_verify);

admin_route.get("/admin_home",admin_controller.load_home);

admin_route.get("/dashbord",admin_controller.load_dashbord);

admin_route.post("/blockuser",admin_controller.blockuser);

admin_route.post("/unblockuser",admin_controller.unblockuser);

admin_route.get("/add_product",admin_controller.add_product);

admin_route.get("/Addcategory",admin_controller.load_category);

admin_route.post("/addcategory",admin_controller.add_category);

admin_route.post("/delite_cat",admin_controller.remove_category);

admin_route.get("/lodcatedit",admin_controller.load_editcategory)

admin_route.post("/edit_cat",admin_controller.edit_category);


module.exports= admin_route;