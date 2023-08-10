const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')
const orderHelper = require('../helper/orderHelper')
const adminHelper = require('../helper/adminHelper')

const bcrypt = require('bcrypt')
const config = require('../configuration/config')

const loadLogin = async(req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        const adminData = await Admin.findOne({email:email})
        if(adminData){
            if(password===adminData.password){
                req.session.admin_id = adminData._id
                return res.redirect('/admin/dashboard')
            }else{
                res.render('login',{message:"Email and password are incorrect"})
            }
        }else{
            res.render('login',{message:"Email and password are incorrect"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard = async(req, res) => {
    try {
        res.render('dashboard')
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async(req, res) => {
   try {
    req.session.admin_id = null
    res.redirect('/admin')
   } catch (error) {
    console.log(error.message)
   }
}

const manageUser = async(req, res)=>{
    try {
        // const { name, email, mobile, password} = req.body
        // const userData = await User.findOne({email : email})
        const allUsers = await User.find({}, { password: 0 }).sort({name :1})
        res.render("index" , {allUsers})
    } catch (error) {
        console.log(error.message)
    }
}

const blockUser = async(req,res)=>{
    try {
      console.log("blocked");
      const id = req.body.userId
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
      res.send({status:true})
    } catch (error) {
      console.log(error)
    }
  }

  const unBlockUser = async(req,res)=>{
    try {
      const id = req.body.userId
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
      res.send({status:true})
    } catch (error) {
      console.log(error.message)
    }
  }

  const orderList = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    orderHelper.getOrderList(page, limit)
      .then(({ orders, totalPages, page: currentPage, limit: itemsPerPage }) => {
        res.render("orderList", {
          orders,
          totalPages,
          page: currentPage,
          limit: itemsPerPage,
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  const changeStatus = async(req,res) => {
    const orderId = req.body.orderId
    const status = req.body.status
    adminHelper.changeOrderStatus(orderId, status)
    .then((response) => {
      console.log(response);
      res.json(response);
    });
  }

  const cancelOrder = async(req,res)=>{
    const userId = req.body.userId
    const orderId = req.body.orderId
    const status = req.body.status
    adminHelper.cancelOrder(orderId,userId,status).then((response) => {
      res.send(response);
    });
  }

  const returnOrder = async(req,res)=>{
    const orderId = req.body.orderId
    const status = req.body.status
    const userId = req.body.userId
    adminHelper.returnOrder(orderId,userId,status).then((response) => {
      res.send(response);
    });
  }

  const orderDetails = async (req,res)=>{
    try {
      const id = req.query.id
      adminHelper.findOrder(id).then((orders) => {
        const address = orders[0].shippingAddress
        const products = orders[0].productDetails 
        res.render('orderDetails',{orders,address,products}) 
      });
    } catch (error) {
      console.log(error.message);
    }
  }

module.exports = {
    loadLogin,
    verifyLogin,
    logout,
    loadDashboard,
    manageUser,
    blockUser,
    unBlockUser,
    orderList,
    changeStatus,
    cancelOrder,
    returnOrder,
    orderDetails
}