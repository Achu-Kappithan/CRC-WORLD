let User, Product, brand, category, bcrypt, nodemailer, otp_generator, priceHelper, Wishlist, applyofferprice, Cart, user_otp;

try {
  User = require("../models/user_models");
  console.log("User model loaded successfully.");

  Product = require("../models/product");
  console.log("Product model loaded successfully.");

  brand = require("../models/brand");
  console.log("Brand model loaded successfully.");

  category = require("../models/category");
  console.log("Category model loaded successfully.");

  bcrypt = require("bcrypt");
  console.log("bcrypt module loaded successfully.");

  nodemailer = require("nodemailer");
  console.log("nodemailer module loaded successfully.");

  otp_generator = require("otp-generator");
  console.log("OTP generator loaded successfully.");

  ({ price: priceHelper } = require("../utils/pricehelper"));
  console.log("Price helper loaded successfully.");

  Wishlist = require("../models/wishlist");
  console.log("Wishlist model loaded successfully.");

  ({ applyofferprice } = require("../utils/offeruils"));
  console.log("Offer utils loaded successfully.");

  Cart = require("../models/cart");
  console.log("Cart model loaded successfully.");

  user_otp = require("../models/otp");
  console.log("OTP model loaded successfully.", user_otp);
} catch (error) {
  console.error("Error loading modules:", error.message);
}

<<<<<<< HEAD
const statuscode = require('../utils/statusCode')
=======
 

>>>>>>> 99bb74a (Save local changes before pulling)


const crypto = require("crypto");
require("dotenv").config();

//for loading sign in page

const loadlogin = (req, res) => {
  try {
    const message = req.flash("message");
    const type = req.flash("type");
    return res.status(statuscode.OK).render("login", { message, type });
  } catch (err) {
    console.log("error for loading login page", err);
    res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", { message: "unable to load userlogin page" });
  }
};

//for loding sign up page

const loadsignup = (req, res) => {
  try {
    const message = req.flash("message");
    const type = req.flash("type");
    return res.status(statuscode.OK).render("register", { message, type });
  } catch (err) {
    console.log("error for loading signup page", err);
    res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", { message: "unable to load signup page" });
  }
};

// encrypt password

const encryptpass = async (password) => {
  try {
    const hashpass = await bcrypt.hash(password, 10);
    // console.log(hashpass);
    return hashpass;
  } catch (err) {
    console.log("error for hashing passwordd", err);
    res.status(statuscode.INTERNAL_SERVER_ERROR).render("user404");
  }
};

// for register new user

const signup_user = async (req, res) => {
  try {
    const { firstname, lastname, email, password, confirm } = req.body;

    // console.log(`PASSWORD IS ${req.body.password}`);
    const userexist = await User.findOne({ email: email });
    if (userexist) {
      req.flash("message", "User Alredy exist plz Login");
      req.flash("type", "warning");
      return res.status(statuscode.BAD_REQUEST).redirect("/register");
    }
    const otp = otp_generator.generate(6, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log(`this is the generated otp`, otp);

    const otp_data = new user_otp({
      email: email,
      otp: otp,
    });

    await otp_data.save();

    req.session.form_data = { firstname, lastname, email, password, confirm };

    console.log("Session Data:", req.session.form_data);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: {
        name: "CRC_WORLD",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Your OTP Code",
      text: ` Hello, your OTP code is '${otp}' It will be expire in 1 minute.`,
    };

    // console.log('Transporter Config:', transporter.options);

    const sendMail = async () => {
      try {
        await transporter.sendMail(mailOptions);

        console.log("Email has been sent!");
      } catch (error) {
        console.log("Error sending email:", error);
      }
    };
    await sendMail();

    return res.status(statuscode.OK).redirect("/otp");
  } catch (err) {
    console.log("error for registering the user", err);
    res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", {
        message: "unable to register new user plz tray again",
      });
  }
};

//  for loading otp page
const user_send_otp = async (req, res) => {
  try {
    const message = req.flash("message");
    const type = req.flash("type");
    return res.status(statuscode.OK).render("otp", { message, type });
  } catch (error) {
    console.log("error with otp".error.message);
    return res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", { message: "error while resending the otp" });
  }
};

// veryfing otp and redirect ot loginpage

const verify_otp = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(`this is the form data`, req.session.form_data);

    const { firstname, lastname, email, password } = req.session.form_data;

    console.log(otp);

    const otp_data = await user_otp.findOne({
      email: email,
      $or: [{ otp: otp }, { resendotp: otp }],
    });

    console.log(`this is the otp received`, otp_data);
    if (otp_data) {
      const user_data = new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: await encryptpass(password),
        is_admin: false,
      });

      await user_data.save();
      console.log("user data saved to databse");
      req.flash("message", "USER REGISTRATION SUCESSFULLY COMPLITED");
      req.flash("type", "success");
      return res.redirect("/login");
    } else {
      req.flash("message", "Invalid Otp");
      req.flash("type", "error");
      return res.status(statuscode.NOT_FOUND).redirect("/otp");
    }
  } catch (err) {
    console.log(`error from verify otp function `, err);
    res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", {
        message: "unable to connect due to otp regading error ",
      });
  }
};

// re generate otp

const resend_otp = async (req, res) => {
  try {
    if (!req.session.form_data || !req.session.form_data.email) {
      req.flash("message", "Session expired or email not found in session.");
      req.flash("type", "error");
      return res.status(statuscode.BAD_REQUEST).redirect("/login");
    }

    const { email } = req.session.form_data;
    console.log("email is ", email);
    if (!email) {
      req.flash("message", "Session expired or email not found in session.");
      req.flash("type", "error");
      return res.status(statuscode.BAD_REQUEST).redirect("/login");
    }

    const otpDocument = await user_otp.findOne({ email });

    if (!otpDocument) {
      req.flash("message", "Otp not found");
      req.flash("type", "error");
      return res.status(statuscode.BAD_REQUEST).redirect("/otp");
    }

    const newOtp = otp_generator.generate(8, {
      digit: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log(`this is the resend otp:`, newOtp);

    otpDocument.resendotp = newOtp;
    await otpDocument.save();

    // req.session.form_data = { firstname, lastname, email, password, confirm };
    req.session.form_data.resendotp = newOtp;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: {
        name: "CRC_WORLD",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Your OTP Code",
      text: ` Hello, your OTP code is '${newOtp}' It will be expire in 1 minute.`,
    };

    const sendMail = async () => {
      try {
        await transporter.sendMail(mailOptions);

        console.log("Email has been sent!");
      } catch (error) {
        console.log("Error sending email:", error);
      }
    };
    await sendMail();

    return res.redirect("/otp");
  } catch (err) {
    console.log("error for sending resend otp ", err);
    res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", { message: "Unable to complate the request" });
  }
};

// user verifications

const userverification = async (req, res) => {
  try {
    const email = req.body.user_email;
    const password = req.body.user_password;
    const userdata = await User.findOne({ email: email });

    if (userdata) {
      const passmatch = await bcrypt.compare(password, userdata.password);
      if (passmatch) {
        const isactive = userdata.is_active;
        if (!isactive) {
          req.flash("message", "User Not Authorized for Login");
          req.flash("type", "error");
          res.redirect("/login");
        } else {
          req.session.user_id = userdata._id;
          console.log("this  is the id for logined user", req.session.user_id);
          return res.redirect("/load_home");
        }
      } else {
        req.flash("message", "EMAIL OR PASSWORD IS INCORRECT");
        req.flash("type", "info");
        return res.redirect("/login");
      }
    } else {
      req.flash("message", "Invalid  User");
      req.flash("type", "warning");
      return res.redirect("/login");
    }
  } catch (err) {
    console.log("error for user verification", err.message);
    res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", { message: "Error regarding user verification" });
  }
};

/// for loading home pagde

const loadhome = async (req, res) => {
  try {
    const message = req.flash("message")
    const type = req.flash("type")
    const userid = req.session.user_id;
    const gadgetcat = await category.findOne({name:{$regex:/Gadgets/i}});
    const batcategory = await category.findOne({name:{$regex:/Bat/i}});
    let wishlistdata = null
    // console.log("this is batcat", batcategory)

    if(userid){
       wishlistdata = await Wishlist.findOne({userId:userid});
       if(!wishlistdata){
          let  wishlist = new Wishlist({
            userId : userid,
            productIds : []
          });
          await wishlist.save()
       }
    }

    let batlist = null;
    let gadlist =null;
    if (batcategory) {
       batlist = await Product.find({
        category: batcategory._id,
        is_deleted: false,
      })
        .populate("category")
        .populate("brand");
      batlist = await applyofferprice(batlist);

    }
    if(gadgetcat){
       gadlist = await Product.find({
        category: gadgetcat._id,
        is_deleted: false,
      })
        .populate("category")
        .populate("brand");
      gadlist =  await applyofferprice(gadlist);

    }
    const branddata = await brand.find({ is_deleted: false });

    let productlist = await Product.find({ is_deleted: false })
      .populate("category")
      .populate("brand");
    productlist = await applyofferprice(productlist);

      // console.log("product in the home",productlist)

    return res.render("user_home", {
      productlist,
      batlist,
      gadlist,
      branddata,
      priceHelper,
      wishlist :wishlistdata,
      message,
      type
    });
  } catch (err) {
    console.log("error for loading  home page ", err);
    res.status(statuscode.INTERNAL_SERVER_ERROR).render("user404", { message: "Unable to load  home page" });
  }
};

// load forgotpasword page

const load_forgotpass = async (req, res) => {
  try {
    const message = req.flash("message");
    const type = req.flash("type");
    return res.status(statuscode.OK).render("forgotpassword", { message, type });
  } catch (err) {
    console.log("error for loading  the forgotpassword page", err);
    res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", { message: "unable to load forgotpassword page" });
  }
};

//check the email and  send otp

const resetpass_mail = async (req, res) => {
  try {
    const email = req.body.user_email;

    const userdata = await User.findOne({ email });
    // console.log(userdata);

    if (!userdata) {
      req.flash("message", "NO user found with the email");
      req.flash("type", "warning");
      return res.redirect("/forgotpassword");
    } else {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      userdata.pass_resettoken = hashedToken;
      userdata.pass_resettime = Date.now() + 10 * 60 * 1000;
      await userdata.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      });


      const URL =  process.env.URL
      const resetUrl = `${URL}/reset_password/${resetToken}`;
      const mailOptions = {
        from: {
          name: "CRC_WORLD",
          address: process.env.EMAIL_USER,
        },
        to: email,
        subject: "Reset Password",
        text: `Reset your password using this link: ${resetUrl}`,
      };

      // console.log('Transporter Config:', transporter.options);

      const sendMail = async () => {
        try {
          await transporter.sendMail(mailOptions);

          console.log("Email has been sent!");
        } catch (error) {
          console.log("Error sending email:", error);
        }
      };
      await sendMail();
      req.flash("message", "Email send successfully , check your e-mail");
      req.flash("type", "success");
      return res.redirect("/login");
    }
  } catch (err) {
    console.log("error for reset pass mail ", err);
    res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", { message: "unable to complate your request" });
  }
};

// load reset password page

const reset_password = async (req, res) => {
  try {
    const token = req.params.token;
    return res.render("reset_password", { token });
  } catch (err) {
    console.log(err);
  }
};

// update reset password to database

const update_password = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const resetToken = req.params.token;
    console.log("this is the token", resetToken);

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      pass_resettoken: hashedToken,
      pass_resettime: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Invalid or expired token");
      return res.status(statuscode.BAD_REQUEST).redirect("/login");
    }

    // Update password
    // user.password = await bcrypt.hash(newPassword, 10);
    (user.password = await encryptpass(newPassword)),
      (user.pass_resettoken = undefined);
    user.pass_resettime = undefined;
    await user.save();

    req.flash("sucess", "Password updated sucessfully");
    req.flash("type", "success");
    return res.redirect("/login");
  } catch (err) {
    console.log("error for update  new passowrd ", err);
    res.status(statuscode.INTERNAL_SERVER_ERROR).render("user404", "Unable to complate your request");
  }
};

const logout_user = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.status(statuscode.BAD_REQUEST).redirect("/load_home");
      } else {
        res.status(statuscode.OK).redirect("/login");
      }
    });
  } catch (err) {
    console.log("error related to logout", err);
    res
      .status(statuscode.INTERNAL_SERVER_ERROR)
      .render("user404", { message: "Unable to complate the request" });
  }
};

module.exports = {
  // user registration
  loadsignup,
  signup_user,
  verify_otp,
  user_send_otp,
  resend_otp,

  // user login
  loadhome,
  loadlogin,
  userverification,
  load_forgotpass,
  logout_user,

  // forgot password
  resetpass_mail,
  reset_password,
  update_password,
};
