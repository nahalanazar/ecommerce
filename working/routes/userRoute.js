const express = require('express')
const userRoute = express.Router()

const auth = require('../middleware/auth')

userRoute.use(auth.checkSession)

//const session = require("express-session")

const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const profileController = require('../controller/profileController')
const orderController = require('../controller/orderController')

userRoute.get('/', userController.home)
userRoute.get('/index', userController.home)

userRoute.get('/signup', userController.signup)
userRoute.post('/signup', userController.insertUser)

userRoute.get('/login', userController.login)
userRoute.post('/loginValidate', userController.verifyLogin)
userRoute.post('/loginValidate2', userController.verifyLogin2)

userRoute.post('/verifyOtp', userController.verifyOtp)

userRoute.get('/forgotPassword', userController.loadForgotPassword)
userRoute.post('/forgotPasswordOtp', userController.forgotPasswordOtp)
userRoute.post('/forgotPassword', userController.resetPasswordOtpVerify)
userRoute.post('/setNewPassword', userController.setNewPassword)

userRoute.get('/logout', userController.userLogout)

userRoute.get('/shop', auth.isLogin, userController.shop)
userRoute.get('/productPage', auth.isLogin, productController.productPage)
userRoute.get('/categoryShop', auth.isLogin, userController.categoryPage)

userRoute.get('/cart', auth.blocked, cartController.loadCart)
userRoute.post('/addToCart/:id', auth.cartBlocked, cartController.addToCart)
userRoute.delete('/delete-product-cart', auth.isLogin, cartController.deleteProduct)
userRoute.put('/change-product-quantity', auth.isLogin, cartController.updateQuantity)

userRoute.get('/profile', auth.isLogin, profileController.profile)
userRoute.post('/editInfo', auth.isLogin, profileController.editInfo)
userRoute.get('/profileAddress', auth.isLogin, profileController.profileAddress)
userRoute.post('/submitAddress', auth.isLogin, profileController.submitAddress)
userRoute.post('/updateAddress', auth.isLogin, profileController.editAddress)
userRoute.get('/deleteAddress', auth.isLogin, profileController.deleteAddress)

userRoute.get('/checkOut', auth.isLogin, orderController.checkOut)
userRoute.post('/checkOutAddress', auth.isLogin, profileController.checkOutAddress)
userRoute.post('/checkOut', auth.isLogin, orderController.postCheckOut)

userRoute.post('/changeDefaultAddress', auth.isLogin, orderController.changePrimary)
userRoute.get('/profileOrderList', auth.isLogin, orderController.orderList)
userRoute.put('/cancelOrder', auth.isLogin, orderController.cancelOrder)   
userRoute.get('/orderDetails', auth.isLogin, orderController.orderDetails)


userRoute.get('/error_500', userController.error500)
userRoute.get('/error_403', userController.error403)

module.exports = userRoute

