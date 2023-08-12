const express = require('express')
const auth = require('../middleware/adminAuth')

const adminRoute = express()

adminRoute.set('view engine', 'ejs')
adminRoute.set('views','./views/admin')

const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productController')
const multer = require('../multer/multer')

adminRoute.get('/', adminController.loadLogin)
adminRoute.post('/verify', adminController.verifyLogin)
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

// Error-handling middleware
adminRoute.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        // Specific error messages based on Multer's error codes
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).send('File is too large. Maximum allowed size is 2MB.');
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).send('Too many files. Maximum 3 files are allowed.');
            case 'LIMIT_FILE_TYPE':
                return res.status(400).send('Invalid file type. Only jpg, jpeg, and png are allowed.');
            // ... you can handle other error codes if needed
            default:
                return res.status(400).send('Error uploading file.');
        }
    } else {
        // This is a general error handler
        console.error('An error occurred:', error.message);
        res.status(500).send("Server Error: " + error.message);
    }
});


module.exports = adminRoute