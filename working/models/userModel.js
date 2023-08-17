const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        // unique: true
    },
    password:{
        type:String,
        required:true
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    wallet: {
        type: Number,
        default: 0
    },
    walletTransaction: {
        type: Array
    },
    coupons: {
        type: Array
    }
});

module.exports = mongoose.model('User', userSchema)