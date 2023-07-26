const express = require("express")
const userRoute = express.Router()

const auth = require('../middleware/auth')

userRoute.use(auth.checkSession)

// const session = require("express-session")

const userController = require("../controller/userController")
userRoute.get('/', userController.home)
userRoute.get('/index', userController.home)
userRoute.get('/login', userController.login)
userRoute.get('/signup', userController.signup)
userRoute.post('/loginValidate', userController.verifyLogin)
userRoute.post('/signup', userController.insertUser)
userRoute.get('/product', userController.product)
userRoute.post('/index', userController.verifyOtp)
userRoute.get('/logout',userController.userLogout)


module.exports = userRoute

