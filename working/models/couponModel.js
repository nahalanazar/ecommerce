const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        // unique: true,
        // index: true
    },
    validity: {
        type: Date,
        default: new Date()
    },
    minPurchase: {
        type: Number,
        min: 0
    },
    minDiscountPercentage: {
        type: Number,
        min: 0
    },
    maxDiscountValue: {
        type: Number,
        min: 0
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('Coupon', couponSchema)