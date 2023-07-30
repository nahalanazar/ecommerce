const { login } = require("../controller/userController")
const User = require("../models/userModel")



const checkSession = (req, res, next) => {
    res.locals.userName = req.session.username
    const isAuthenticated = req.session.user_id
    res.locals.isAuthenticated = isAuthenticated
    next()
}


// const blocked = async(req, res, next) => {
//     const userData = await User.findOne({mobile:mobile})
//     try {
//         if(userData.is_blocked){
//             req.session.user_id=null
//             res.redirect('/login')
//         }
//         next()
//     } catch (error) {
//         console.log(error.message)
//     }
// }


module.exports = {
    checkSession
}