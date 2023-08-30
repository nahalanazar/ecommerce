const Coupon = require('../models/couponModel')
const couponHelper = require('../helper/couponHelper')
const couponList = async (req, res) => {
    try {
        const couponList = await Coupon.find()
        res.render('couponList', {couponList})
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddCoupon = async (req, res) => {
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error.message)
    }
}

// const generateCouponCode = (req, res) => {
//     couponHelper.generateCouponCode()
//         .then((couponCode) => {
//         res.send(couponCode)
//     })
// }

const addCoupon = (req, res) => {
    try {
        const data = {
            couponCode: req.body.coupon,
            validity: req.body.validity,
            minPurchase: req.body.minAmount,
            minDiscountPercentage: req.body.discountPercentage,
            maxDiscountValue: req.body.maxDiscount,
            description: req.body.description
        }
        couponHelper.addCoupon(data)
            .then((response) => {
                res.json(response)
        })
    } catch (error) {
        console.log(error.message)
    }
}

const removeCoupon = async(req, res) => {
    try {
        const id = req.body.couponId
        await Coupon.deleteOne({ _id: id })
        res.json({status: true})
    } catch (error) {
        console.log(error.message);
    }
}

const verifyCoupon = (req, res) => {
    const couponCode = req.params.id
    const userId = res.locals.user._id
    couponHelper.verifyCoupon(userId, couponCode)
        .then((response) => {
            res.send(response)
        })
}

const applyCoupon = async (req, res) => {
    console.log("apply");
    const couponCode = req.params.id
    const userId = res.locals.user._id
    const total = await couponHelper.totalCheckOutAmount(userId)
    couponHelper.applyCoupon(couponCode, total)
        .then((response) => {
            console.log(response);
            res.send(response)
        })
}

module.exports = {
    couponList,
    loadAddCoupon,
    //generateCouponCode,
    addCoupon,
    removeCoupon,
    verifyCoupon,
    applyCoupon 
}