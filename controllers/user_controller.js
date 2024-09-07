const User = require("../models/user_models");
const bcrypt = require("bcrypt");
const user_otp = require("../models/otp");
const nodemailer = require("nodemailer");
const otp_generator = require("otp-generator");
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
    console.log(hashpass);
    return hashpass;
  } catch (err) {
    console.log(err);
  }
};

// for register new user

const signup_user = async (req, res) => {
  try {
    const { firstname, lastname, email, password, confirm } = req.body;

    

    // if (password !== confirm) {
    //   return res.render("register", { message: "Passwords do not match!" });
    // }

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
    return res.render("user_home")
  } catch (err) {

    console.log(err)
    
  }
}


module.exports = {
  loadlogin,
  loadsignup,
  signup_user,
  verify_otp,
  user_send_otp,
  loadhome,
  resend_otp,
  userverification
};
