const User = require('../models/userModel')
const Address = require('../models/addressModel')
const profileHelper = require('../helper/profileHelper')
const cartHelper = require('../helper/cartHelper')

const profile = async (req, res, next) => {
    try {
      const usercart = res.locals.user

      const count = await cartHelper.getCartCount(usercart.id)

        const user = res.locals.user
        res.render('public/profile', { user, count });
      } catch (error) {
        console.log(error.message)
        next(error);
    }
}

const editInfo = async (req, res, next) => {
    try {
      const userId = res.locals.user._id;
      const { name, email, mobile } = req.body;
      const result = await User.updateOne(
        { _id: userId }, // Specify the user document to update based on the user ID
        { $set: { name, email, mobile } } // Set the new field values
      );
      res.redirect("/profile");
    } catch (error) {
      console.log(error.message);
      next(error);
    }
}

const profileAddress = async (req, res, next) => {
    try {
      const usercart = res.locals.user

      const count = await cartHelper.getCartCount(usercart.id)
        let arr = []
        const user = res.locals.user
        const address = await Address.find({user: user._id.toString()})
        if(address){
            const ad = address.forEach((x) => {
                return (arr = x.addresses)
            })
            res.render('public/profileAddress', {user, arr, count})
        }
    } catch (error) {
        console.log(error.message)
        next(error);
    }
}

const submitAddress = async (req, res, next) => {
    try {
        const userId = res.locals.user._id;
        const name = req.body.name;
        const mobileNumber = req.body.mno;
        const address = req.body.address;
        const locality = req.body.locality;
        const city = req.body.city;
        const pincode = req.body.pincode;
        const state = req.body.state;    
        
        const newAddress = {
            name: name,
            mobileNumber: mobileNumber,
            address: address,
            locality: locality,
            city: city,
            pincode: pincode,
            state: state
        };

        const updatedUser = await profileHelper.submitAddress(userId, newAddress)
        if(!updatedUser){
            await profileHelper.createAddress(userId, newAddress)
        }
        
        res.json({message: "Address saved successfully"})
        // res.redirect('/profileAddress')
    } catch (error) {
        console.log(error.message)
        next(error);
    }
}

const editAddress = async (req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    const address = req.body.address;
    const locality = req.body.locality;
    const city = req.body.city;
    const pincode = req.body.pincode;
    const state = req.body.state;
    const mobileNumber = req.body.mobileNumber;
  
    const update = await Address.updateOne(
      { "addresses._id": id }, 
      {
        $set: {
          "addresses.$.name": name,
          "addresses.$.address": address,
          "addresses.$.locality": locality,
          "addresses.$.city": city,
          "addresses.$.pincode": pincode,
          "addresses.$.state": state,
          "addresses.$.mobileNumber": mobileNumber,
        },
      }
    );
}

  const deleteAddress = async (req, res, next) => {
    const userId = res.locals.user._id;
    const addId = req.query.id;
  
    const deleteobj = await Address.updateOne(
      { user: userId }, 
      { $pull: { addresses: { _id: addId } } }
    );
  
    res.redirect("/profileAddress");
  }

  const checkOutAddress = async (req, res, next) => {
    try {
      const userId = res.locals.user._id;
      const name = req.body.name;
      const mobileNumber = req.body.mno;
      const address = req.body.address;
      const locality = req.body.locality;
      const city = req.body.city;
      const pincode = req.body.pincode;
      const state = req.body.state;
  
      const newAddress = {
        name: name,
        mobileNumber: mobileNumber,
        address: address,
        locality: locality,
        city: city,
        pincode: pincode,
        state: state,
      };
  
      const updatedUser = await profileHelper.submitAddress(userId, newAddress);
      if (!updatedUser) {
        await profileHelper.createAddress(userId, newAddress);
      }
      res.redirect("/checkOut"); 
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }
  
  const walletTransaction = async(req, res, next)=>{
    try {
      const user = res.locals.user
      const count = await cartHelper.getCartCount(user.id)
      // const userData= await User.findOne({_id:user._id})
      const wallet = await User.aggregate([
        {$match:{_id:user._id}},
        {$unwind:"$walletTransaction"},
        {$sort:{"walletTransaction.date":-1}},
        {$project:{walletTransaction:1,wallet:1}}
      ])
      res.render('public/walletTransaction',{wallet, count})
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }


module.exports = {
    profile,
    editInfo,
    profileAddress,
    submitAddress,
    editAddress,
    deleteAddress,
    checkOutAddress,
    walletTransaction
}