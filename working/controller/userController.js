//const { name } = require("ejs");
const User = require("../models/userModel")
const Product = require("../models/productModel")
const Category = require("../models/categoryModel")
const bcrypt = require("bcrypt");
require('dotenv').config();

//const otpHelper=require("../Helper/otpHelper")
// const accountSid = process.env.TWILIO_SID
// const authToken = process.env.TWILIO_AUTH_TOKEN
// const verifySid = "VAe86f583a3b6c2a84119a5f15ef3c7c89";
// const client = require("twilio")(accountSid, authToken);

const accountSid = "AC2494e61a37ee26d347cbbf64da4d268c";
const authToken = "34f8d49af9a2a357fe48f753d805cffa";
const verifySid = "VAe86f583a3b6c2a84119a5f15ef3c7c89";
const client = require("twilio")(accountSid, authToken);


// const home = async (req, res) => {
//     try {
//       //if(req.session.ivide_check){
//         //console.log(req.session)
//         res.render('public/index')
//       //}else{
//         //res.redirect('/login')
//       //}
//     } catch (error) {
//         console.log(error.message)
//     }
// }

const home = async (req, res) => {
  try {
    const category = await Category.find({});
    const page = parseInt(req.query.page) || 1; 
    const limit = 8;
    const skip = (page - 1) * limit; // Calculate the number of products to skip

    // Fetch products with pagination
    const totalProducts = await Product.countDocuments({ $and: [{ isListed: true }, { isProductListed: true }] }); // Get the total number of products
    const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages

    // const products = await Product.find({ $and: [{ isListed: true }, { isProductListed: true }] })
    //   .skip(skip)
    //   .limit(limit)
    //   .populate('category');

      const products = await Product.find({ $and: [{ isListed: true }, { isProductListed: true }] })
      .populate('category');

    res.render('public/index', { product: products, category, currentPage: page, totalPages });
  } catch (error) {
    console.log(error.message);
  }
};

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
      const existingUser = await User.findOne({$or: [{email:email}, {mobile:mobile}]})

      const spassword = await securePassword(password);
      if(!req.body.name || req.body.name.trim().length === 0){
        return res.render("public/signup", { message: "Name is required", formData: req.body})
      }
      if (/\d/.test(req.body.name)) {
        return res.render("public/signup", { message: "Name should not contain numbers", formData: req.body });
      }
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(mobile)) {
          return res.render("public/signup", { message: "Mobile Number should have 10 digits", formData: req.body });
      }
      if(existingUser){
        return res.render("public/signup",{message:"User already registered", formData: req.body})
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)){
          return res.render("public/signup", { message: "Email Not Valid", formData: req.body });
      }
      
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if(!passwordRegex.test(req.body.password)){
          return res.render("public/signup", { message: "Password Should Contain atleast 8 characters, one number and a special character", formData: req.body });
      }


      if(req.body.password!=req.body.confPassword){
          return res.render("public/signup", { message: "Password and Confirm Password must be same", formData: req.body });
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
      const mobile = req.body.mobile
      const password = req.body.password
  
      const userData = await User.findOne({mobile:mobile})
      console.log(userData,"vl userdata");
     
  
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if(passwordMatch){
          if(userData.is_blocked){
            res.render('public/login', {message:"Your account is blocked"})
            console.log("you are blocked");
          }else{
            // const otp = otpHelper.generateOtp()
            // const phone= otpHelper.sendOtp(mobile,otp)
            //   console.log(`Otp is ${otp}`)
            client.verify.v2
      .services(verifySid)
        .verifications.create({to:`+91${mobile}`,channel:'sms'})
      .then((verification) => {
        console.log(verification.status)
        req.session.userData = req.body;
        req.session.mobile = mobile 
        req.session.username = userData.name
        res.render('public/verifyOtp', { mobile: mobile });
      })
            // try {
            //     req.session.otp = otp;
              
            //     res.render('public/verifyOtp')     
            // } catch (error) {
            //     console.log(error.message); 
            // }
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

      const otp =req.body.otp;
       const mobile = req.body.mobile
        const user = await User.findOne({mobile:mobile})
        if (!user) {
            res.render('public/verifyOtp',{ message: 'Invalid Session' });
        }else{
          client.verify.v2
      .services(verifySid)
      .verificationChecks.create({to:`+91${mobile}`, code: otp})
      .then((verification_check)=>{
        console.log(verification_check.status);
         req.session.loggedIn = true;
         req.session.user_id=user;
         res.redirect('/')
      })
            
            // res.redirect('/')
            // console.log(userName)
        }
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


  const shop = async (req, res) => {
    try {
      const category = await Category.find({});
      const page = parseInt(req.query.page) || 1; 
      const limit = 6;
      const skip = (page - 1) * limit; // Calculate the number of products to skip
  
      // Fetch products with pagination
      const totalProducts = await Product.countDocuments({ $and: [{ isListed: true }, { isProductListed: true }] }); // Get the total number of products
      const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages
  
      const products = await Product.find({ $and: [{ isListed: true }, { isProductListed: true }] })
        .skip(skip)
        .limit(limit)
        .populate('category');

        // const products = await Product.find({ $and: [{ isListed: true }, { isProductListed: true }] })
        // .populate('category');
  
      res.render('public/shop', { product: products, category, currentPage: page, totalPages });
    } catch (error) {
      console.log(error.message);
    }
  };

  const categoryPage = async (req,res) =>{
    try{
        const  categoryId = req.query.id
        const category = await Category.find({ })
        const page = parseInt(req.query.page) || 1; 
        const limit = 6;
        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments({ category:categoryId,$and: [{ isListed: true }, { isProductListed: true }]}); // Get the total number of products
        const totalPages = Math.ceil(totalProducts / limit);
         
        const product = await Product.find({ category:categoryId,$and: [{ isListed: true }, { isProductListed: true }]})
        .skip(skip)
        .limit(limit)
        .populate('category')
        res.render('public/categoryShop',{product,category, currentPage: page, totalPages, categoryId })
      }
    catch(err){
        console.log('category page error',err);
      }
  }



module.exports= {
    home,
    login,
    signup,
    insertUser,
    verifyLogin,
    verifyOtp,
    userLogout,
    shop,
    categoryPage
}