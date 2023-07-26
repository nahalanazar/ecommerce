const { name } = require("ejs");
const User = require("../models/userModel")
const bcrypt = require("bcrypt");
require('dotenv').config();
const otpHelper=require("../Helper/otpHelper")

const home = async (req, res) => {
    try {
      //if(req.session.ivide_check){
        //console.log(req.session)
        res.render('public/index')
      //}else{
        //res.redirect('/login')
      //}
    } catch (error) {
        console.log(error.message)
    }
}

const login = async (req, res) => {
    try {
        res.render('public/login')
    } catch (error) {
        console.log(error.message)
    }
}

const signup = async (req, res) => {
    try {
        res.render('public/signup')
    } catch (error) {
        console.log(error.message)
    }
}

const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log(error.message,"1");
    }
  };

const insertUser = async (req, res) => {
    try {
      const { name, email, mobile, password } = req.body;
      const existingUser = await User.findOne({email:email})
      const spassword = await securePassword(password);
      if(!req.body.name || req.body.name.trim().length === 0){
        return res.render("public/signup", { message: "Name is required"})
      }
      if (/\d/.test(req.body.name)) {
        return res.render("public/signup", { message: "Name should not contain numbers" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)){
          return res.render("public/signup", { message: "Email Not Valid" });
      }
      if(existingUser){
        return res.render("public/signup",{message:"Email already exists"})
      }
      const mobileNumberRegex = /^\d{10}$/;
      if (!mobileNumberRegex.test(mobile)) {
          return res.render("public/signup", { message: "Mobile Number should have 10 digits" });
      }
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if(!passwordRegex.test(req.body.password)){
          return res.render("public/signup", { message: "Password Should Contain atleast 8 characters, one number and a special character" });
      }


      if(req.body.password!=req.body.confPassword){
          return res.render("public/signup", { message: "Password and Confirm Password must be same" });
      }

      const user = new User({
        name: name,
        mobile: mobile,
        email: email,
        password: spassword,
      });
  
      const userData = await user.save();
      if (userData) {
        res.render("public/login");
      } else {
        throw new Error("can't save the user data");
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  const verifyLogin = async(req, res)=>{
    try {
      const mobileNumber = req.body.mobile
      const password = req.body.password
  
      const userData = await User.findOne({mobile:mobileNumber})
     
  
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if(passwordMatch){
          if(userData.is_blocked){
            res.render('public/login', {message:"Your account is blocked"})
            console.log("you are blocked");
          }else{
            const otp = otpHelper.generateOtp()
            //const phone= otpHelper.sendOtp(mobileNumber,otp)
              console.log(`Otp is ${otp}`)
            try {
                req.session.otp = otp;
                req.session.userData = req.body;
                req.session.mobile = mobileNumber 
                req.session.username = userData.name
                res.render('public/verifyOtp')     
            } catch (error) {
                console.log(error.message); 
            }
          }
        }else{
          res.render('public/login', {message:"Password is incorrect"})
        }
      } else {
        res.render('public/login', {message:"Email is incorrect"})
      }
  
    } catch (error) {
      console.log(error.message)
    }
  }

  const verifyOtp = async (req, res) => {
    const otp=req.body.otp
    try {

      const sessionOTP=req.session.otp;
        const userData=req.session.userData;
        
        if (!sessionOTP || !userData) {
            res.render('public/verifyOtp',{ message: 'Invalid Session' });
        }else if (sessionOTP !== otp) {
            res.render('public/verifyOtp',{ message: 'Invalid OTP' });
        }else{

            req.session.user_id=userData;
            
            res.redirect('/')
            console.log(userName)
        }
    } catch (error) {
        console.log(error.message)
    }
  }
  
const product = async (req, res) => {
    try {
        res.render('public/product')
    } catch (error) {
        console.log(error.message)
    }
}

const userLogout = async(req, res)=>{
  try {
    req.session.user_id=null
    res.redirect('/login')
  } catch (error) {
    console.log(error.message)
  }
}

module.exports= {
    home,
    login,
    signup,
    product,
    insertUser,
    verifyLogin,
    verifyOtp,
    userLogout
}