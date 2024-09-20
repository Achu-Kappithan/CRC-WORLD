const User = require("../models/user_models");
const Prouduct = require("../models/product");
const brand = require("../models/brand");
const category = require("../models/category");
const bcrypt = require("bcrypt");
const user_otp = require("../models/otp");
const nodemailer = require("nodemailer");
const otp_generator = require("otp-generator");
const crypto = require("crypto")
require("dotenv").config();





//for loading sign in page
const loadlogin = (req, res) => {
  try {
    return res.render("login", { message: null });
  } catch (err) {
    console.log(err);
  }
};

//for loding sign up page

const loadsignup = (req, res) => {
  try {
    return res.render("register", { message: null });
  } catch (err) {
    console.log(err);
  }
};

// encrypt password

const encryptpass = async (password) => {
  try {
    const hashpass = await bcrypt.hash(password, 10);
    // console.log(hashpass);
    return hashpass;
  } catch (err) {
    console.log(err);
  }
};

// for register new user

const signup_user = async (req, res) => {
  try {
    const { firstname, lastname, email, password, confirm } = req.body;

    


    console.log(`PASSWORD IS ${req.body.password}`);
    const userexist = await User.findOne({ email: email });
    if (userexist) {
      req.flash("error","USER ALREDAY EXISTS")
      return res.redirect("/register");
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
        secure: false, // Disable using SSL directly (use STARTTLS)
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
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

    return res.redirect("/otp");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  for loading otp page
const user_send_otp = async (req, res) => {
  try {
    return res.status(200).render("otp");
  } catch (error) {
    console.log("error with otp".error.message);
    return res.status(400).send("error while resending the otp");
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
      $or: [{ otp: otp }, { resendotp: otp }]
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
      req.flash("success", "USER REGISTRATION SUCESSFULLY COMPLITED");
      return res.redirect("/login");
    } else {
      return res.send("invalidotp");
    }
  } catch (err) {
    console.log(`error from verify otp function `, err.message);
  }
};

// re generate otp 

const resend_otp = async (req,res)=>{

try {

  if (!req.session.form_data || !req.session.form_data.email) {
    return res.status(400).json({ message: "Session expired or email not found in session." });
  }

  const { email } = req.session.form_data;
  console.log( "email is ", email)
  if (!email) {
    return res.status(400).json({ message: "Session expired or email not found in session." });
  }

  const otpDocument = await user_otp.findOne({ email });

    if (!otpDocument) {
      return res.status(404).json({ message: "OTP not found" });
    }



  const newOtp = otp_generator.generate(8, {
    digit:true, 
    alphabets: false,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });
  console.log(`this is the resend otp:`,newOtp)
 
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
  secure: false, // Disable using SSL directly (use STARTTLS)
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
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
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

// user verifications

const userverification = async(req,res)=>{
  try {
    const email = req.body.user_email
    const password = req.body.user_password
    const userdata = await User.findOne({ email: email })

    if(userdata){  
      const passmatch = await bcrypt.compare(password,userdata.password);
      if(passmatch){
        const isactive =userdata.is_active;
        if(!isactive){
          req.flash("error", "SERVICE IS UNAVAILABLE");
          res.redirect("/login")
        }else{
        req.session.user_id= userdata._id
        return res.redirect("/load_home")
      }
      }else{
        req.flash("error", "EMAIL OR PASSWORD IS INCORRECT");
        return res.redirect("/login")
      }
    }else {
      req.flash("error", "INVALID USER PLZ TRY AGAIN");
      return res.redirect("/login")

    }

  } catch (err) {
    console.log(err.message)
  }
}
  

/// for loading home pagde
const loadhome = async (req,res)=>{
  try {
    const gadgetcat = await category.findOne({name:"Cricket  Gadgets"});
    const batcategory =  await category.findOne({name:"Cricket Bat"});
    console.log("this is batcat", batcategory)

    if(!batcategory && !gadgetcat){
    }
    const batlist = await Prouduct.find({category: batcategory._id , is_delited:false})
    const gadlist = await Prouduct.find({category: gadgetcat._id , is_delited:false})
    const branddata = await brand.find({is_delited:false})

    const productlist = await Prouduct.find({is_delited:false})
    .populate('category')  // Populate the category field
    .populate('brand');    // Populate the brand field

    return res.render("user_home",{productlist,batlist,gadlist,branddata})
  } catch (err) {

    console.log(err)
    
  }
}

// load forgotpasword page

const load_forgotpass = async (req,res)=>{
  try {
    return res.render("forgotpassword")
    
  } catch (err) {
    console.log(err)
  }
}

//check the email and  send otp

const resetpass_mail = async (req,res)=>{
  try {
    const email = req.body.user_email;
    
    const userdata = await User.findOne({email});
    console.log(userdata)

    if(!userdata){
      req.flash("error","NO user found with the email")
      return res.redirect("/forgotpassword")
    }else{
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      userdata.pass_resettoken = hashedToken;
      userdata.pass_resettime = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
      await userdata.save();


      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        secure: false, // Disable using SSL directly (use STARTTLS)
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      });
      

    const resetUrl = `http://localhost:7001/reset_password/${resetToken}`;
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
    req.flash("success","E mail send sucessfully , check your e -mail")
    return res.redirect("/login");
    }
    
  } catch (err) {
    console.log(err)
    
  }
}



// load reset password page

const reset_password = async (req,res)=>{
  try {
    const token = req.params.token;

    return res.render("reset_password",{token})
  } catch (err) {
    console.log(err);
  }
}

// update reset password to database

const update_password = async (req,res)=>{
  try {
      const { newPassword } = req.body;
      const resetToken = req.params.token;
      console.log("this is the token",resetToken)
    
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    
      const user = await User.findOne({
        pass_resettoken: hashedToken,
        pass_resettime: { $gt: Date.now() },
      });
    
      if (!user) {
        req.flash('error',"Invalid or expired token")
        return res.status(400).redirect('/login');
      }
    
      // Update password
      // user.password = await bcrypt.hash(newPassword, 10);
      user.password = await encryptpass(newPassword),
      user.pass_resettoken= undefined;
      user.pass_resettime = undefined;
      await user.save();

      req.flash("sucess","Password updated sucessfully")
      return res.redirect("/login");
    
    
    
  } catch (err) {
    console.log(err);
  }
}

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

  // forgot password
  resetpass_mail,
  reset_password,
  update_password
};
