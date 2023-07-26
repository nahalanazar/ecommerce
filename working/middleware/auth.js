const { login } = require("../controller/userController")



const checkSession = (req, res, next) => {
    res.locals.userName = req.session.username
    console.log(res.locals.userName)
    const isAuthenticated = req.session.user_id
    res.locals.isAuthenticated = isAuthenticated
    next()
}

module.exports = {
    checkSession
}