//const { name } = require("ejs");
const User = require("../models/userModel")
const Product = require("../models/productModel")
const Category = require("../models/categoryModel")
const Banner = require("../models/bannerModel")
const cartHelper = require("../helper/cartHelper")
const bcrypt = require("bcrypt");
require('dotenv').config();

//const otpHelper=require("../Helper/otpHelper")
// const accountSid = process.env.TWILIO_SID
// const authToken = process.env.TWILIO_AUTH_TOKEN
// const verifySid = "VAe86f583a3b6c2a84119a5f15ef3c7c89";
// const client = require("twilio")(accountSid, authToken);

const accountSid = "AC2494e61a37ee26d347cbbf64da4d268c";
const authToken = "7d42896718af74606302c7906f5980bc";
const verifySid = "VAa679d7990591abe277854951c2ebcdb9";
const client = require("twilio")(accountSid, authToken);


// const home = async (req, res, next) => {
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

const home = async (req, res, next) => {
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
      .limit(limit)
      .populate('category');
    
    const banner = await Banner.find({})

    res.render('public/index', { product: products, banner, category, currentPage: page, totalPages});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const login = async (req, res, next) => {
    try {
        res.render('public/login')
    } catch (error) {
      console.log(error.message)
      next(error);
    }
}

const signup = async (req, res, next) => {
    try {
        res.render('public/signup')
    } catch (error) {
      console.log(error.message)
      next(error);
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

const insertUser = async (req, res, next) => {
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

  const verifyLogin2 = async(req, res, next) => {
    try {
      const mobile = req.body.mobile
      const password = req.body.password
      const userData = await User.findOne({mobile:mobile})
      if(userData){
        const passwordMatch =await bcrypt.compare(password, userData.password)
        if(passwordMatch){
          if(userData.is_blocked){
            res.render('public/login', {message:"Your account is blocked"})
            console.log("you are blocked");
          }else{
            req.session.user_id = userData._id
            req.session.username = userData.name
            res.redirect('/');
          }
        }else{
          res.render('public/login', {message:"Password is incorrect"})
        }
    }
    } catch (error) {
      console.log(error.message)
    }
  }


  const verifyLogin = async(req, res, next)=>{
    try {
      const mobile = req.body.mobile
      const password = req.body.password
  
      const userData = await User.findOne({mobile:mobile})
  
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if(passwordMatch){
          if(userData.is_blocked){
            res.render('public/login', {message:"Your account is blocked"})
            console.log("you are blocked");
          }else{
            client.verify.v2
            .services(verifySid)
            .verifications.create({to:`+91${mobile}`,channel:'sms'})
            .then((verification) => {
              console.log(verification.status)
              req.session.user_id = userData._id
              req.session.userData = req.body;
              req.session.mobile = mobile 
              req.session.username = userData.name
              res.render('public/verifyOtp', { mobile: mobile });
            })           
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

  const verifyOtp = async (req, res, next) => {
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
          if (verification_check.status === "approved") {
            req.session.loggedIn = true;
            req.session.user_id = user;
            res.redirect('/');
          } else if (verification_check.status === "denied") {
            res.render('public/verifyOtp', { message: 'Incorrect OTP' });
          }
          })
        }
    } catch (error) {
        console.log(error.message)
    }
  }
  
  const loadForgotPassword = async(req, res, next) => {
    try {
      res.render('public/forgotPassword')
    } catch (error) {
      console.log(error.message)
      res.redirect('/error_500')
    }
  }

  const forgotPasswordOtp = async(req, res, next) => {
    const user = await User.findOne({mobile: req.body.mobile})
    const mobile = req.body.mobile
    if(!user){
      res.render('public/forgotPassword', {message:"User not registered"})
    }else{
      client.verify.v2
      .services(verifySid)
        .verifications.create({to:`+91${mobile}`,channel:'sms'})
      .then((verification) => {
        console.log(verification.status)
        req.session.mobile = user.mobile
        res.render('public/forgotPasswordOtp');
      })
    }
  }

  const resetPasswordOtpVerify = async (req, res, next) => {
    try {
      const otp =req.body.otp;
       const mobile = req.session.mobile
        const user = await User.findOne({mobile:mobile})
        if (!user) {
            res.render('public/forgotPasswordOtp',{ message: 'Invalid Session' });
        }else{
          client.verify.v2
          .services(verifySid)
          .verificationChecks.create({to:`+91${mobile}`, code: otp})
          .then((verification_check)=>{
          console.log(verification_check.status);
          if (verification_check.status === "approved") {
            res.render('public/resetPassword')
          } else if (verification_check.status === "denied") {
            res.render('public/forgotPasswordOtp', { message: 'Incorrect OTP' });
          }
          })
        }
    } catch (error) {
      console.log(error)
      next(error);
    }
  }

  const setNewPassword = async (req, res, next) => {
    const newPw = req.body.newPassword
    const confirmPw = req.body.confirmPassword
    const mobile = req.session.mobile
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!passwordRegex.test(req.body.newPassword)){
      return res.render ('public/resetPassword', {message:"Password Should Contain atleast 8 characters,one number and a specialr characte"})
    }
    if(newPw === confirmPw){
      const sPassword = await securePassword(newPw)
      const newUser = await User.updateOne({mobile:mobile}, {$set:{password:sPassword}})
      res.redirect('/login')
    }else{
      res.render('public/resetPassword', {message:"Password and Confirm Password is not matching"})
    }  
  } 


  const userLogout = async(req, res, next)=>{
    try {
      req.session.user_id=null
      req.session.destroy()
      res.redirect('/login')
    } catch (error) {
      console.log(error.message)
    }
  }


  const shop = async (req, res, next) => {
    try {
      const user = res.locals.user;

      const count = await cartHelper.getCartCount(user.id);
      const category = await Category.find({});
      const selectedCategoryId = req.query.id || null;  // This fetches the selected category ID from the query string

      const page = parseInt(req.query.page) || 1; 
      const limit = 8;
      const skip = (page - 1) * limit;

      const searchQuery = req.query.search || ''; // Get the search query from request query parameters
      const sortQuery = req.query.sort || 'default'; // Get the sort query from request query parameters (default value is 'default')
      const minPrice = parseFloat(req.query.minPrice); // Get the minimum price from request query parameters
      const maxPrice = parseFloat(req.query.maxPrice)

      // Conditionally filter products by category if a category ID is provided
      const filterCriteria = {
        $and: [
          { isListed: true },
          { isProductListed: true },
          {
            $or: [
              { name: { $regex: new RegExp(searchQuery, 'i') } },
            ]
          }] };
      if (selectedCategoryId) {
        filterCriteria.category = selectedCategoryId;
      }
 
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        filterCriteria.$and.push({ price: { $gte: minPrice, $lte: maxPrice } });
      }

      let sortOption = {};
      if (sortQuery === 'price_asc' ||sortQuery === 'default' ) {
        sortOption = { price: 1 }; 
      } else if (sortQuery === 'price_desc') {
        sortOption = { price: -1 }; 
      }

      const totalProducts = await Product.countDocuments(filterCriteria);
      const totalPages = Math.ceil(totalProducts / limit);

      const products = await Product.find(filterCriteria)
        .skip(skip) 
        .limit(limit) 
        .sort(sortOption)
        .populate('category');

      res.render('public/shop', { product: products, category, selectedCategoryId, currentPage: page, totalPages, count, sortQuery });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
};


  const categoryPage = async (req,res) =>{
    try{
      const user = res.locals.user

      const count = await cartHelper.getCartCount(user.id)

        const  categoryId = req.query.id
        const category = await Category.find({ })
        const page = parseInt(req.query.page) || 1; 
        const limit = 8;
        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments({ category:categoryId,$and: [{ isListed: true }, { isProductListed: true }]}); // Get the total number of products
        const totalPages = Math.ceil(totalProducts / limit);
         
        const product = await Product.find({ category:categoryId,$and: [{ isListed: true }, { isProductListed: true }]})
        .skip(skip)
        .limit(limit)
        .populate('category')
        res.render('public/categoryShop',{product,category, currentPage: page, totalPages, categoryId, count})
      }
    catch(err){
      console.log('category page error', err);
      next(err);
      }
  }

  const error500 = async (req, res, next) => {
    try {
      res.render('public/error_500')
    } catch (error) {
      console.log(error)
    }
  }

  const error403 = async (req, res, next) => {
    try {
      res.render('public/error_403')
    } catch (error) {
      console.log(error)
    }
  }

  const success = async (req, res, next) => {
    try {
      res.render('public/success')
    } catch (error) {
      console.log(error.message)
    }
  }
  
const failed = async (req, res, next) => {
    try {
      res.render('public/failed')
    } catch (error) {
      console.log(error.message)
    }
  }


module.exports= {
    home,
    login,
    signup,
    insertUser,
    verifyLogin,
    verifyLogin2,
    verifyOtp,
    loadForgotPassword,
    forgotPasswordOtp,
    resetPasswordOtpVerify,
    setNewPassword,
    userLogout,
    shop,
    categoryPage,
    error500,
    error403,
    success,
    failed
}