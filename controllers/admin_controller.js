const Admin = require("../models/user_models")
const category = require("../models/category")
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

// load admin home

const load_home = async (req,res)=>{
    try {
    const admin = Admin.findById({_id:req.session.admin_id})
     res.render("admin_home")
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
                    return res.redirect("/admin_home")
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

// load admin dashbord / users list and details

const load_dashbord = async(req,res)=>{

    try {
        const search= req.query.user_search;
        // console.log(search)
        if(search){
            const searchdata = await Admin.find({ 
                is_admin: 0,
                $or: [
                    { firstname: { $regex: search, $options: 'i' } },
                    { lastname: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            });
            req.flash("error", "no user found");
            return res.render("admin_dashbord",{users:searchdata})
        }else{
        const userdetails = await Admin.find({is_admin:0})
       return res.render("admin_dashbord",{users:userdetails})
        }
    } catch (err) {
        console.log(err)
        
    }
}

//block user

const blockuser = async (req,res)=>{
    try {
        const userid = req.query.id
        
        const blkusr = await Admin.findByIdAndUpdate(userid,{is_active:false})
        req.flash("error","User sucessfully bocked")
        res.redirect("/dashbord")
        
    } catch (err) {
        console.log(err)
        
    }
}

//unblockuser 

const unblockuser = async (req,res)=>{
    try {
        const userid = req.query.id
        
        const blkusr = await Admin.findByIdAndUpdate(userid,{is_active:true})
        req.flash("success","user sucessfully unblocked")
        res.redirect("/dashbord")
        
    } catch (err) {
        console.log(err)
        
    }
}


// load add category page

const load_category = async (req,res)=>{
    try {
        const category_list = await category.find({is_delited:false});
        if(!category_list){
            res.render("addcategory",{cat : category_list})
        }else{
            res.render("addcategory",{cat : category_list})
        }
       
    } catch (err) {
        console.log(err)
        
    }
}

// add new category into category list

const add_category = async (req,res)=>{
    try {
        const { name, discription } = req.body;
        
        if (!name || !discription) {
            req.flash("error", "ALL FIELD ARE REQUIRED");
            return res.redirect('/Addcategory')
        }
        const newcategory = new category({
            name: req.body.name,
            discription: req.body.discription

        });
        newcategory.save();
        req.flash("success","Category added sucessfully")
        res.redirect("/Addcategory")
    } catch (err) {
        console.log(err)
        
    }
}


// remove a category from the list

const remove_category = async (req,res)=>{
    try {
        const id = req.query.id
       const item = await category.findByIdAndUpdate(id,{is_delited: true });
       req.flash("error", "Category removed sucessfully");
        return res.redirect("/Addcategory")
    } catch (err) {
        console.log(`A error regading to remove category`,err)
    }
}

// for loading edit category page
const load_editcategory = async (req,res)=>{
    try {
        const id = req.query.id
        const editdata = await category.findById({_id:id})
        return res.render("categoryedit",{data:editdata})
        
    } catch (err) {
        console.log(`error regadig to load editcateditpage${err}`)
        
    }
}

// for updating  edited  category info

const edit_category = async (req,res)=>{
    try {
        const id = req.body.id
        const data = await category.findByIdAndUpdate(
            id,
            {$set:{
                name: req.body.name,
                discription: req.body.discription
            }})
            req.flash("success","CATEGORY UPDATED SUCESSFULLY")
            return res.redirect("/Addcategory")
        
    } catch (err) {
        console.log(err)
        
    }
}

// logout the admin

const admin_logout = async (req,res)=>{
    try {
        res.redirect("/")
    } catch (err) {
        consolo.log(err)
    }
}




module.exports = {

// authotication
    load_adminlogin,
    load_home,
    admin_verify,
    admin_logout,


// user releted section
    load_dashbord,
    blockuser,
    unblockuser,

//  categories
    load_category,
    add_category,
    remove_category,
    edit_category,
    load_editcategory,


}