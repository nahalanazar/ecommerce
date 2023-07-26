const express = require('express')
const adminRoute = express()
const auth = require('../middleware/adminAuth')

adminRoute.set('view engine', 'ejs')
adminRoute.set('views','./views/admin')

const adminController = require('../controller/adminController')

adminRoute.get('/', adminController.loadLogin)
adminRoute.post('/', adminController.verifyLogin)
adminRoute.get('/index', auth.isLogin, adminController.manageUser)
adminRoute.get('/logout', auth.isLogin, adminController.logout)
adminRoute.get('/blockUser', auth.isLogin, adminController.blockUser)
adminRoute.get('/unBlockUser', auth.isLogin, adminController.unBlockUser)


module.exports = adminRoute