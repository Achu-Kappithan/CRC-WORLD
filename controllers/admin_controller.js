const Admin = require("../models/user_models");
const category = require("../models/category");
const bcrypt = require("bcrypt");
require("dotenv").config;
const {generate_salesreport,getdaterange ,top_sellingitems }= require("../utils/generatereport")
const statuscode = require("../utils/statusCode");

// load admin login page

const load_adminlogin = async (req, res) => {
  try {
    return res.status(statuscode.OK).render("admin_login");
  } catch (err) {
    console.error("Error loading admin login page:", err);
    res.status(statuscode.INTERNAL_SERVER_ERROR) .render("404", { message: "Internal Server Error. Unable to load the admin login page."});
  }
};

// load admin home

const load_home = async (req, res) => {
  try {
    const option = req.query.report ? req.query.report : "weekly"
    const { startdate, enddate } = getdaterange(option);
    const report = await generate_salesreport(startdate, enddate);
    const topSellings = await top_sellingitems()

    // console.log("top sellilngs",topSellings)

    const admin = await Admin.findById({ _id: req.session.admin_id });
    return res.status(statuscode.OK).render("admin_home",{ report, period: option,topSellings });
  } catch (err) {
    console.log("erro for loading admin home page", err);
    return res.status(statuscode.INTERNAL_SERVER_ERROR).render("404", { message: "unable to load home page" });
  }
};

// Admin verification

const admin_verify = async (req, res) => {
  try {
    const email = req.body.admin_email;
    const password = req.body.admin_password;
    const admindata = await Admin.findOne({ email: email });

    if (admindata) {
      const passmatch = await bcrypt.compare(password, admindata.password);
      if (passmatch) {
        if (admindata.is_admin == 0) {
          req.flash("error", "SORRY ADMIN CAN ONLY LOGIN");
          return res.status(statuscode.UNAUTHORIZED).redirect("/admin");
        } else {
          req.session.admin_id = admindata._id;
          return res.status(statuscode.OK).redirect("/admin_home");
        }
      } else {
        req.flash("error", "EMAIL OR PASSWORD IS INCORRECT");
        return res.status(statuscode.BAD_REQUEST).redirect("/admin");
      }
    } else {
      req.flash("error", "USER NOT FOUND");
      return res.status(statuscode.BAD_REQUEST).redirect("/admin");
    }
  } catch (err) {
    console.log("error veryfing the user", err);
    return res.status(statuscode.INTERNAL_SERVER_ERROR).render("404", { message: "unable to veryfiy user" });
  }
};

// load admin dashbord / users list and details

const load_dashbord = async (req, res) => {
  try {
    const page = req.query.page;
    const limit = 6;
    const search = req.query.user_search;
    // console.log(search)

    const totaluser = await Admin.countDocuments()
    const totalPages = Math.ceil(totaluser/limit)

    if (search) {
      const searchdata = await Admin.find({
        is_admin: 0,
        $or: [
          { firstname: { $regex: search, $options: "i" } },
          { lastname: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).skip((page-1)*limit).limit(limit)

      req.flash("error", "no user found");
      return res.status(statuscode.BAD_REQUEST).render("admin_dashbord", { users: searchdata, totalPages, page });
    } else {
      const userdetails = await Admin.find({ is_admin: 0 });
      return res.render("admin_dashbord", { users: userdetails, totalPages, page });
    }
  } catch (err) {
    console.log("error for loading dashbord", err);
    return res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("404", { message: "unable to load dashbord page" });
  }
};

//block user

const blockuser = async (req, res) => {
  try {
    const userid = req.query.id;

    const blkusr = await Admin.findByIdAndUpdate(userid, { is_active: false });
    req.flash("error", "User sucessfully bocked");
    return res.status(statuscode.OK).redirect("/dashbord");
  } catch (err) {
    console.log("error for blocking the user", err);
    return res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("404", { message: "unable to  block use tray again..!" });
  }
};

//unblockuser

const unblockuser = async (req, res) => {
  try {
    const userid = req.query.id;

    const blkusr = await Admin.findByIdAndUpdate(userid, { is_active: true });
    req.flash("success", "user sucessfully unblocked");
    return res.status(statuscode.OK).redirect("/dashbord");
  } catch (err) {
    console.log("error for unblocking the user", err);
    return res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("404", { message: "unable to unblock user tray again..!" });
  }
};

// load add category page

const load_category = async (req, res) => {
  try {
    const category_list = await category.find({ is_deleted: false });
    if (!category_list) {
      return res.status(statuscode.OK).render("addcategory", { cat: category_list });
    } else {
      return res.status(statuscode.OK).render("addcategory", { cat: category_list });
    }
  } catch (err) {
    console.log("error for load category page", err);
    return res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("404", { message: "unable to load category page" });
  }
};

// add new category into category list

const add_category = async (req, res) => {
  try {
    const { name, discription } = req.body;
    const normalized_name = name.trim().toLowerCase()

    if (!name || !discription) {
      req.flash("error", "ALL FIELD ARE REQUIRED");
      return res.status(statuscode.BAD_REQUEST).redirect("/Addcategory");
    }

    existingdata = await category.findOne({name: normalized_name});

    if(existingdata){
      req.flash("error","Category alredy exist")
     return res.status(statuscode.BAD_REQUEST).redirect("/Addcategory")
    }


    const newcategory = new category({
      name: normalized_name,
      discription: req.body.discription,
    });
    await newcategory.save();
    req.flash("success", "Category added sucessfully");
    return res.status(statuscode.OK).redirect("/Addcategory");
  } catch (err) {
    console.log("error for adding new category", err);
    return res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("404", { message: "unable to add a new category" });
  }
};

// remove a category from the list

const remove_category = async (req, res) => {
  try {
    const id = req.query.id;
    const item = await category.findByIdAndUpdate(id, { is_deleted: true });
    req.flash("error", "Category removed sucessfully");
    return res.status(statuscode.OK).redirect("/Addcategory");
    
  } catch (err) {
    console.log(`A error regading to remove category`, err);
    return res
      .statu(statuscode.INTERNAL_SERVER_ERROR)
      .render("404", { message: "unable to remove category tray again..!" });
  }
};

// for loading edit category page

const load_editcategory = async (req, res) => {
  try {
    const id = req.query.id;
    const editdata = await category.findById({ _id: id });
    return res.status(statuscode.OK).render("categoryedit", { data: editdata });
  } catch (err) {
    console.log(`error regadig to load editcateditpage`, err);
    return res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("404", { message: "unable loading editcategory page" });
  }
};

// for updating  edited  category info

const edit_category = async (req, res) => {
  try {
    const {name , discription } = req.body
    const normalized_name = name.trim().toLowerCase()
    const id = req.body.id;
    // console.log("name ffomr body ",name)

    const existingdata = await category.findById({_id:id})
    console.log("existing data by id",existingdata)
    const matchname = await category.findOne({name:normalized_name})
    if(existingdata.name==normalized_name){
      await category.findByIdAndUpdate(id, {
        $set: {
          name: normalized_name ,
          discription: discription,
        },
      });
      req.flash("success", "CATEGORY UPDATED SUCESSFULLY");
      return res.status(statuscode.OK).redirect("/Addcategory");

    }else if(!matchname){
    const data = await category.findByIdAndUpdate(id, {
      $set: {
        name: normalized_name,
        discription: req.body.discription,
      },
    });
    req.flash("success", "CATEGORY UPDATED SUCESSFULLY");
    return res.status(statuscode.OK).redirect("/Addcategory");
  }else{
    req.flash("error","Category alredy exist")
    return res.status(statuscode.BAD_REQUEST).redirect("/Addcategory")
  }
  } catch (err) {
    console.log("unable update category tray again..!", err);
    return res.status(statuscode.INTERNAL_SERVER_ERROR).render("404",{message:"Unable to complite your request"})
  }
};

// logout the admin

const admin_logout = async (req, res) => {
  try {
    req.session.destroy();
    return res.status(statuscode.OK).redirect("/admin");
  } catch (err) {
    console.log("error for logout the user", err);
    return res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("404", { message: "unable to logout try again..!" });
  }
};

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
};
