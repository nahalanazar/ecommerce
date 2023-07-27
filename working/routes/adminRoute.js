const express = require('express')
const adminRoute = express()
const auth = require('../middleware/adminAuth')

adminRoute.set('view engine', 'ejs')
adminRoute.set('views','./views/admin')

const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')

adminRoute.get('/', adminController.loadLogin)
adminRoute.post('/', adminController.verifyLogin)
adminRoute.get('/index', auth.isLogin, adminController.manageUser)
adminRoute.get('/logout', auth.isLogin, adminController.logout)
adminRoute.get('/blockUser', auth.isLogin, adminController.blockUser)
adminRoute.get('/unBlockUser', auth.isLogin, adminController.unBlockUser)

adminRoute.get('/categoryManagement', auth.isLogin, categoryController.loadCategory)
adminRoute.get('/addCategory', auth.isLogin, categoryController.loadAddCategory)
adminRoute.post('/addCategory', auth.isLogin, categoryController.createCategory)
adminRoute.get('/editCategory', auth.isLogin, categoryController.loadUpdateCategory)


module.exports = adminRoute