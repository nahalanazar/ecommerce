const Product = require('../models/productModel')
const Category = require('../models/categoryModel');


const unListCategory = async(categoryId)=>{
    try {
      await Category.findByIdAndUpdate(categoryId,{isListed:false});
      await Product.updateMany({ category: categoryId }, {$set:{ isListed: false }})
    } catch (error) {
        console.log(error)
    }
  }

  const reListCategory = async(categoryId)=>{
    try {
      await Category.findByIdAndUpdate(categoryId,{isListed:true});
      await Product.updateMany({ category: categoryId },{$set:{ isListed: true }})
    } catch (error) {
        console.log(error)
    }
  }


  module.exports = {
    unListCategory,
    reListCategory
  }