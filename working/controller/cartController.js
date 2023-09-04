const Cart = require('../models/cartModel')
const cartHelper = require('../helper/cartHelper')

const loadCart = async (req, res, next) => {
    try {
        const user = res.locals.user
        const count = await cartHelper.getCartCount(user.id)
        let cartTotal = 0
        const total = await Cart.findOne({user: user.id})
        if(total){
            cartTotal = total.cartTotal
            const cart = await Cart.aggregate([
                {
                    $match: {user: user.id}
                },
                {
                    $unwind:"$cartItems"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "cartItems.productId",
                        foreignField: "_id",
                        as: "carted"
                    }
                },
                {
                    $project:{
                        item: "$cartItems.productId",
                        quantity: "$cartItems.quantity",
                        total: "$cartItems.total",
                        carted: { $arrayElemAt: ["$carted", 0]}
                    }
                }
            ])
            res.render('public/cart', {cart, user, count, cartTotal})
        } else {
            res.render('public/cart', {user, count, cartTotal, cart: []})
        }
    } catch (error) {
        console.log(error.message)
        next(error);
    }
}

const addToCart = (req, res, next) => {
    try {
        cartHelper.addCart(req.params.id, res.locals.user._id)
        .then((response) => {
            res.send(response)
        })
    } catch (error) {
        console.log(error.message)
        next(error);
    }
}

const deleteProduct = (req, res, next) => {
    cartHelper.deleteProduct(req.body).then((response) => {
        res.send(response)
    })
}

const updateQuantity = (req, res, next) => {
    const userId = res.locals.user._id
    cartHelper.updateQuantity(req.body)
    .then(async (response) => {
        res.json(response)
    })
}

module.exports = {
    loadCart,
    addToCart,
    deleteProduct,
    updateQuantity
}

