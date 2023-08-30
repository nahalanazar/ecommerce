const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')
const orderHelper = require('../helper/orderHelper')
const adminHelper = require('../helper/adminHelper')


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

const loadDashboard = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $unwind: "$orders" },
      { $match: { "orders.orderStatus": "Delivered" } },
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
          count: { $sum: 1}
      }}
    ])

    const categorySales = await Order.aggregate([
      { $unwind: "$orders" },
      { $unwind: "$orders.productDetails"},
      { $match: { "orders.orderStatus": "Delivered" } },
      {
        $project: {
          CategoryId: "$orders.productDetails.category",
          totalPrice: {
            $multiply: [
              { $toDouble: "$orders.productDetails.productPrice" },
              { $toDouble: "$orders.productDetails.quantity"}
            ]
          }
        }
      },
      {
        $group: {
          _id: "$CategoryId",
          PriceSum: { $sum: "$totalPrice"}
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          categoryName: "$categoryDetails.name",
          PriceSum: 1,
          _id: 0
        }
      }
    ])

    const salesData = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          "orders.orderStatus": "Delivered"
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$orders.createdAt"
            }
          },
          dailySales: { $sum: { $toInt: "$orders.totalPrice" } }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const salesCount = await Order.aggregate([
      { $unwind: "$orders" },
      { $match: { "orders.orderStatus": "Delivered" } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$orders.createdAt"
            }
          },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const categoryCount = await Category.find({}).count()
    const productsCount = await Product.find({}).count()

    const onlinePay = await adminHelper.getOnlineCount()
    const walletPay = await adminHelper.getWalletCount()
    const codPay = await adminHelper.getCodCount()

    const latestOrders = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $sort: {
        'orders.createdAt': -1
        }
      },
      { $limit: 10 }
    ])

    res.render('dashboard', {orders, productsCount, categoryCount, salesCount, salesData, categorySales, onlinePay, walletPay, codPay, order: latestOrders})
  } catch (error) {
    console.log(error) 
    res.status(500).send('Internal Server Error')
  }
}

const logout = async(req, res) => {
   try {
    req.session.admin_id = null
    req.session.destroy()
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

  const getSalesReport = async (req, res) => {
    const report = await adminHelper.getSalesReport()
    let details = []
    const getDate = (date) => {
      const orderDate = new Date(date)
      const day = orderDate.getDate()
      const month = orderDate.getMonth() + 1
      const year = orderDate.getFullYear()
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
    }
    report.forEach((orders) => {
      details.push(orders.orders)
    })
    res.render('salesReport', {details, getDate})
  }
  
  const postSalesReport = async (req, res) => {
    let details = []
    const getDate = (date) => {
      const orderDate = new Date(date)
      const day = orderDate.getDate()
      const month = orderDate.getMonth() + 1
      const year = orderDate.getFullYear()
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
    }

    adminHelper.postReport(req.body).then((orderDate) => {
      orderDate.forEach((orders) => {
        details.push(orders.orders)
      })
      res.render('salesReport', {details, getDate})
    })
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
  orderDetails,
  getSalesReport,
  postSalesReport
}