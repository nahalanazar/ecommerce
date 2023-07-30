const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const productHelper = require('../Helper/productHelper')

const loadProducts = async(req,res)=>{
    try {
      const categories = await Category.find({})
      //res.render('addProduct')
      res.render('addProduct',{category:categories})
    } catch (error) {
      console.log(error.message)
    }
  }

  const displayProduct = async(req,res)=>{
    try {
      const product = await Product.find({}).populate('category')
      res.render('productManagement', {product: product});
    } catch (error) {
      console.log(error.message)
    }
  }

  const createProduct = async(req, res) => {
    try {
      const categories = await Category.find({})
      if (!req.body.name || req.body.name.trim().length === 0) {
        return res.render("addProduct", { message: "Name is required",category:categories });
      }
    if(req.body.price<=0){
      return res.render("addProduct", { message: "Product Price Should be greater than 0",category:categories });
    }

      const images = req.files.map(file => file.filename);
      await productHelper.createProduct(req.body,images)
      res.redirect('/admin/productManagement');
    } catch (error) {
      console.log(error)
    }
  
  };


  const unListProduct = async(req,res)=>{
    try {
      await productHelper.unListProduct(req.query.id)

        res.redirect('/admin/productManagement')
        
    } catch (error) {
        console.log(error.message);
    }
  }

  const reListProduct = async(req,res)=>{
    try {

        await productHelper.reListProduct(req.query.id)
        res.redirect('/admin/productManagement')
    } catch (error) {
        console.log(error.message);
    }
  }

  const loadUpdateProduct = async(req,res)=>{
    try {
      const categories = await Category.find({})
      const id = req.query.id;
      const productData = await Product.findById({_id:id})
      res.render('updateProduct',{product:productData,category:categories})
      
    } catch (error) {
      console.log(error)
    }
  }

  const updateProduct = async (req, res) => {
    try {
      const images = req.files ? req.files.map(file => file.filename) : undefined;
        await productHelper.updateProduct(req.body,images)
        res.redirect('/admin/productManagement');
    } catch (error) {
      console.log(error.message);
    }
  };

  const productPage = async (req, res) => {
    try {
      const id = req.query.id
      const product = await Product.findOne({ _id : id }).populate('category')
      res.render('public/product',{product : product})    } catch (error) {
      console.log(error);
      res.send({ success: false, error: error.message });
    }
  }

  module.exports = {
    loadProducts,
    displayProduct,
    createProduct,
    unListProduct,
    reListProduct,
    loadUpdateProduct,
    updateProduct,
    productPage
  }