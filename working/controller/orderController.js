const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const User = require('../models/userModel')
const Coupon = require('../models/couponModel')
const orderHelper = require('../helper/orderHelper')
const cartHelper = require('../helper/cartHelper')
const couponHelper = require('../helper/couponHelper')
const { ObjectId } = require("mongodb");
const easyInvoice = require('easyinvoice')
const fs = require('fs')
const { Readable } = require('stream')

const checkOut = async (req, res, next) => {
    try {
        const user = res.locals.user
        const count = await cartHelper.getCartCount(user.id)
        const couponList = await Coupon.find()
        const total = await Cart.findOne({user: user.id})
        const address = await Address.findOne({user: user._id}).lean().exec()
        const cart = await Cart.aggregate([
            {$match: {user: user.id}},
            {$unwind: "$cartItems"},
            {$lookup:{
                from: "products",
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "carted"
            }},
            {$project: {
                item: "$cartItems.productId",
                quantity: "$cartItems.quantity",
                total: "$cartItems.total",
                carted: {$arrayElemAt: ["$carted", 0]}
            }}
        ])
        if(address){
            res.render('public/checkOut', {address: address.addresses, cart, total, count, walletBalance: user.wallet, couponList})
        }else{
            res.render('public/checkOut', {address: [], cart, total, count, walletBalance: user.wallet, couponList})
        }
    } catch (error) {
      console.log(error.message)
      next(error);
    }
}

const changePrimary = async (req, res, next) => {
    try {
      const userId = res.locals.user._id
      const result = req.body.addressRadio;
      const user = await Address.find({ user: userId.toString() });
  
      const addressIndex = user[0].addresses.findIndex((address) =>
        address._id.equals(result)
      );
      if (addressIndex === -1) {
        throw new Error("Address not found");
      }
  
      const removedAddress = user[0].addresses.splice(addressIndex, 1)[0];
      user[0].addresses.unshift(removedAddress);
  
      const final = await Address.updateOne(
        { user: userId },
        { $set: { addresses: user[0].addresses } }
      );
  
      res.redirect("/checkout");
    } catch (error) {
      console.log(error.message);
      next(error);
    }
}

const postCheckOut = async (req, res, next) => {
  try {
        const userId = res.locals.user._id;
        const data = req.body;

        await couponHelper.addCouponToUser(data.couponCode, userId);
        const checkStock = await orderHelper.checkStock(userId);
        if (!checkStock) {
            await Cart.deleteOne({ user: userId });
            return res.json({ status: 'OrderFailed' });
        }
 
        const userData = await User.findById({ _id: userId })
        const walletAmount = userData.wallet
 
         // If payment option is wallet + razorpay
        if (data.paymentOption === "wallet_razorpay") {
          if (walletAmount >= data.total) {
          console.log("waallet1a")
        // Handle the case when the wallet has enough or more than enough balance
        //     userData.wallet -= data.total; // Deduct the total amount from the wallet
        //     console.log("userData 1a", userData.wallet)
        //     console.log("dataTotal 1a", data.total)
        // await userData.save();

        // const walletTransaction = {
        //     date: new Date(),
        //     type: "Debit",
        //     amount: data.total,
        // }
  
        // await User.updateOne(
        //     { _id: userId },
        //     { $push: { walletTransaction: walletTransaction } }
        // );

        await orderHelper.updateStock(userId);
        await orderHelper.placeOrder(data, userId);
        await Cart.deleteOne({ user: userId });
        return res.json({ orderStatus: true, message: "order placed successfully using wallet" });

    } else {
        // Handle the case when the wallet doesn't have enough balance and the rest will be handled by Razorpay
        console.log("waallet 2a")
        const remainingAmount = data.finalAmount;

        await orderHelper.placeOrder(data, userId);
        const order = await orderHelper.generateRazorpay(userId, remainingAmount);
        return res.json(order);
    }
} else {
            // ... rest of your code
          if (data.paymentOption === "cod" || data.paymentOption === "wallet") {
            await orderHelper.updateStock(userId);
            await orderHelper.placeOrder(data, userId);
            await Cart.deleteOne({ user: userId });

            if (data.paymentOption === "cod") {
                return res.json({ codStatus: true });
            }

            return res.json({ orderStatus: true, message: "order placed successfully" });
          } else if (data.paymentOption === "razorpay") {
            console.log("payment:razor");
              await orderHelper.placeOrder(data, userId);
            const order = await orderHelper.generateRazorpay(userId, data.total);
            console.log(order);
              return res.json(order);
          }
        }
        
    } catch (error) {
        console.error("Error in postCheckOut:", error.message);
        if (error.message === "Insufficient wallet balance!") {
          return res.status(400).json({ error: "Insufficient wallet balance!" });
        }
    return res.status(500).json({ error: "An error occurred while processing your request." });
    }
}


const orderList = async (req, res, next) => {
    try {
        const user = res.locals.user
        const count = await cartHelper.getCartCount(user.id)

        const orders = await Order.aggregate([
            {$match: {user:user._id}},
            {$unwind: "$orders"},
            {$sort: {"orders.createdAt": -1}}
        ])
        res.render('public/profileOrder', {orders, count})
    } catch (error) {
      console.log(error.message)
      next(error);
    }
}

const cancelOrder = async(req,res)=>{
    const orderId = req.body.orderId
    const status = req.body.status
    orderHelper.cancelOrder(orderId, status).then((response) => {
      res.send(response);
    })
}

const orderDetails = async (req,res)=>{
    try {
      const user = res.locals.user
      const count = await cartHelper.getCartCount(user.id)

      const id = req.query.id
      orderHelper.findOrder(id, user._id).then((orders) => {
        const address = orders[0].shippingAddress
        const products = orders[0].productDetails 
        res.render('public/orderDetails',{orders, address, products, count})
      });      
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  
}

const verifyPayment = (req, res, next) => {
    console.log("payment");
  const orderId = req.body.order.receipt
    orderHelper.verifyPayment(req.body)
        .then(() => {
    orderHelper.changePaymentStatus(res.locals.user._id, req.body.order.receipt,req.body.payment.razorpay_payment_id)
      .then(() => {
        res.json({ status: true });
      })
      .catch((err) => {
        res.json({ status: false });
      });
  }).catch(async(err)=>{
    console.log(err);
    next(err);
  });
}

const paymentFailed = async (req, res, next) => {
    try {
    const order = req.body
    const deleted = await Order.updateOne(
      { "orders._id": new ObjectId(order.order.receipt) },
      { $pull: { orders: { _id:new ObjectId(order.order.receipt) } } }
    )
    res.send({status:true})
    } catch (error) {
      next(error);
  }
}

const downloadInvoice = async (req, res, next) => {
  try {
    const id = req.query.id
    const userId = res.locals.user._id
    const result = await orderHelper.findOrder(id, userId)
    const date = result[0].createdAt.toLocaleDateString()
    const product = result[0].productDetails 

    const order = {
      id: id,
      total: parseInt(result[0].totalPrice),
      date: date,
      payment: result[0].paymentMethod,
      name: result[0].shippingAddress.item.name,
      street: result[0].shippingAddress.item.address,
      locality: result[0].shippingAddress.item.locality,
      city: result[0].shippingAddress.item.city,
      state: result[0].shippingAddress.item.state,
      pincode: result[0].shippingAddress.item.pincode,
      product: result[0].productDetails
    }
    
        let totalQuantity = 0;

    // Iterate through the products and sum up the quantities
    for (const products of product) {
      totalQuantity += products.quantity;
    } 

    console.log('Total Quantity:', totalQuantity, result[0].discountAmount, totalQuantity);

    const discountUsed = parseFloat((result[0].discountAmount) / totalQuantity)
    
    const products = order.product.map((product) => ({
      "quantity": parseInt(product.quantity),
      "description": product.productName,
      "tax-rate": 0,
      // "price": parseInt(product.productPrice)
      "price": parseFloat(product.productPrice-discountUsed), 
      // "discount": parseFloat(discountUsed)
    }))
    // const products = order.product.map((product) => ({
    //   "quantity": parseInt(product.quantity),
    //   "description": product.productName,
    //   "tax-rate": 0,
    //   "price": parseInt(product.productPrice)
    // }))

    var data = {
      customize: {},
      images: {
        background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
      },
      sender: {
        company: "Fashion Palace",
        address: "Brototype",
        zip: "673407",
        city: "Maradu",
        country: "India"
      },
      client: {
        company: order.name,
        address: order.street,
        zip: order.pincode,
        city: order.city,
        country: "India"
      },
      information: {
        number: order.id,
        date: order.date,
        "due-date": "Nil"
      },
      products: products,
      "bottom-notice": "Thank you, Keep Shopping"
    }

    easyInvoice.createInvoice(data, async function (result) {
      await fs.writeFileSync("invoice.pdf", result.pdf, "base64")

      res.setHeader('Content-Disposition', 'attachment; filename= "invoice.pdf"')
      res.setHeader('Content-Type', 'application/pdf')

      const pdfStream = new Readable()
      pdfStream.push(Buffer.from(result.pdf, 'base64'))
      pdfStream.push(null)

      pdfStream.pipe(res)
    })
  } catch (error) {
    console.log(error.message)
    next(error);
  }
}

module.exports = {
    checkOut,
    changePrimary,
    postCheckOut,
    orderList,
    cancelOrder,
    orderDetails,
    verifyPayment,
    paymentFailed,
    downloadInvoice
}