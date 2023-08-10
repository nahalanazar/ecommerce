const express = require('express')
const adminRoute = express()
const auth = require('../middleware/adminAuth')

adminRoute.set('view engine', 'ejs')
adminRoute.set('views','./views/admin')

const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productController')
const multer = require('../multer/multer')


adminRoute.get('/', adminController.loadLogin)
adminRoute.post('/', adminController.verifyLogin)
adminRoute.get('/dashboard', auth.isLogin, adminController.loadDashboard)
adminRoute.get('/index', auth.isLogin, adminController.manageUser)
adminRoute.get('/logout', auth.isLogin, adminController.logout)
adminRoute.post('/blockUser', auth.isLogin, adminController.blockUser)
adminRoute.post('/unBlockUser', auth.isLogin, adminController.unBlockUser)

adminRoute.get('/categoryManagement', auth.isLogin, categoryController.loadCategory)
adminRoute.get('/addCategory', auth.isLogin, categoryController.loadAddCategory)
adminRoute.post('/addCategory', auth.isLogin, categoryController.createCategory)
adminRoute.get('/updateCategory', auth.isLogin, categoryController.loadUpdateCategory)
adminRoute.post('/updateCategory', auth.isLogin, categoryController.updateCategory)
adminRoute.get('/unListCategory', auth.isLogin, categoryController.unListCategory)
adminRoute.get('/reListCategory', auth.isLogin, categoryController.reListCategory)


adminRoute.get('/productManagement', auth.isLogin, productController.displayProduct)
adminRoute.get('/product', auth.isLogin, productController.loadProducts) 
adminRoute.post('/addProduct', multer.upload, productController.createProduct)
adminRoute.get('/unListProduct', productController.unListProduct)
adminRoute.get('/reListProduct', productController.reListProduct)
adminRoute.get('/updateProduct', auth.isLogin, productController.loadUpdateProduct)
adminRoute.post('/updateProduct', multer.upload, productController.updateProduct)

adminRoute.get('/orderList', auth.isLogin, adminController.orderList)
adminRoute.put('/orderStatus', adminController.changeStatus)  
adminRoute.put('/cancelOrder', adminController.cancelOrder)
adminRoute.put('/returnOrder', adminController.returnOrder)
adminRoute.get('/orderDetails', auth.isLogin, adminController.orderDetails)


module.exports = adminRoute