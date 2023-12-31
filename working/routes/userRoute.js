const express = require('express')

const userRoute = express.Router()

const auth = require('../middleware/auth')

userRoute.use(auth.checkSession)


const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const profileController = require('../controller/profileController')
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController')

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

userRoute.get('/cart', auth.isLogin, auth.blocked, cartController.loadCart)
userRoute.post('/addToCart/:id', auth.isLogin, auth.cartBlocked, cartController.addToCart)
userRoute.delete('/delete-product-cart', auth.isLogin, cartController.deleteProduct)
userRoute.put('/change-product-quantity', auth.isLogin, cartController.updateQuantity)

userRoute.get('/profile', auth.isLogin, auth.blocked, profileController.profile)
userRoute.post('/editInfo', auth.isLogin,  auth.blocked, profileController.editInfo)
userRoute.get('/profileAddress', auth.isLogin, auth.blocked, profileController.profileAddress)
userRoute.post('/submitAddress', auth.isLogin, profileController.submitAddress)
userRoute.post('/updateAddress', auth.isLogin, profileController.editAddress)
userRoute.get('/deleteAddress', auth.isLogin, profileController.deleteAddress)
userRoute.get('/wallet', auth.isLogin, auth.blocked, profileController.walletTransaction)

userRoute.get('/checkOut', auth.isLogin, auth.blocked, orderController.checkOut)
userRoute.post('/checkOutAddress', auth.isLogin, profileController.checkOutAddress)
userRoute.post('/checkOut', auth.isLogin, auth.cartBlocked, orderController.postCheckOut)

userRoute.post('/changeDefaultAddress', auth.isLogin, orderController.changePrimary)
userRoute.get('/profileOrderList', auth.isLogin, auth.blocked, orderController.orderList)
userRoute.put('/cancelOrder', auth.isLogin, orderController.cancelOrder)   
userRoute.get('/orderDetails', auth.isLogin, auth.blocked, orderController.orderDetails)

userRoute.get('/applyCoupon/:id', auth.isLogin, auth.blocked, couponController.applyCoupon)
userRoute.get('/verifyCoupon/:id', auth.isLogin, auth.blocked, couponController.verifyCoupon)
 
userRoute.post('/verifyPayment', orderController.verifyPayment)  
userRoute.post('/paymentFailed', orderController.paymentFailed)

userRoute.get('/error_500', userController.error500)
userRoute.get('/error_403', userController.error403)
userRoute.get('/error_404', userController.error404)

userRoute.get('/success', userController.success)
userRoute.get('/failed', userController.failed)

userRoute.get('/invoice', auth.isLogin, auth.blocked, orderController.downloadInvoice)


// Catch-all handler for unmatched requests (any HTTP method)
userRoute.all('*', (req, res, next) => {
    const err = new Error(`Cannot ${req.method} ${req.originalUrl}`);
    err.status = 404; // Set the HTTP status code to 404 (Not Found)
    next(err);
});
   
// Error-handling middleware
userRoute.use((err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging

    const status = err.status || 500;
    let errorCode = status;
    let errorTitle = "";

    // Determining the title based on the status code
    switch (status) {
        case 400:
            errorTitle = "Bad Request";
            break;
        case 404:
            errorTitle = "Page Not Found";
            break;
        case 500:
            errorTitle = "Internal Server Error";
            break;
        default:
            errorTitle = "Error";
    }

    // Render the error page
    res.status(status).render('public/error_500', { 
        errorCode: errorCode, 
        errorTitle: errorTitle,
        errorMessage: err.message 
    });
});
 
module.exports = userRoute;
 