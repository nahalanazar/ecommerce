const Admin = require('../models/adminModel')
const User = require('../models/userModel')

const bcrypt = require('bcrypt')
const config = require('../configuration/config')

const loadLogin = async(req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        const adminData = await Admin.findOne({email:email})
        if(adminData){
            if(password===adminData.password){
                req.session.admin_id = adminData._id
                return res.redirect('/admin/index')
            }else{
                res.render('login',{message:"Email and password are incorrect"})
            }
        }else{
            res.render('login',{message:"Email and password are incorrect"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

// const loadDashboard = async(req, res) => {
//     try {
//         res.render('index')
//     } catch (error) {
//         console.log(error.message)
//     }
// }

const logout = async(req, res) => {
   try {
    req.session.admin_id = null
    res.redirect('/admin')
   } catch (error) {
    console.log(error.message)
   }
}

const manageUser = async(req, res)=>{
    try {
        // const { name, email, mobile, password} = req.body
        // const userData = await User.findOne({email : email})
        const allUsers = await User.find({}, { password: 0 }).sort({name :1})
        res.render("index" , {allUsers})
        console.log(User.name)

    } catch (error) {
        console.log(error.message)
    }
}

const blockUser = async(req,res)=>{
    try {
      const id = req.query.id
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
      res.redirect('/admin/index')
    } catch (error) {
      console.log(error)
    }
  }

  const unBlockUser = async(req,res)=>{
    try {
      const id = req.query.id
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
      res.redirect('/admin/index')
    } catch (error) {
      console.log(error.message)
    }
  }

module.exports = {
    loadLogin,
    verifyLogin,
    logout,
    manageUser,
    blockUser,
    unBlockUser
}