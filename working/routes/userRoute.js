const express = require("express")
const userRoute = express.Router()

const auth = require('../middleware/auth')

userRoute.use(auth.checkSession)

// const session = require("express-session")

const userController = require("../controller/userController")
const productController = require('../controller/productController')

userRoute.get('/', userController.home)
userRoute.get('/index', userController.home)

userRoute.get('/signup', userController.signup)
userRoute.post('/signup', userController.insertUser)

userRoute.get('/login', userController.login)
userRoute.post('/loginValidate', userController.verifyLogin)

userRoute.post('/verifyOtp', userController.verifyOtp)

userRoute.get('/logout',userController.userLogout)

userRoute.get('/shop', userController.shop)
userRoute.get('/productPage', productController.productPage)
userRoute.get('/categoryShop', userController.categoryPage)


module.exports = userRoute

