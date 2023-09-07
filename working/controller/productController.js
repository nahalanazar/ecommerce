const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const productHelper = require('../helper/productHelper')
const cartHelper = require('../helper/cartHelper')


const loadProducts = async(req,res)=>{
    try {
      const categories = await Category.find({})
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

  const createProduct = async(req, res, next) => {
    try {
      const categories = await Category.find({})
      if (!req.body.name || req.body.name.trim().length === 0) {
        return res.status(400).send("Name is required");
      }
      if (!req.body.description || req.body.description.trim().length === 0) {
        return res.status(400).send("Description is required");
      }
      if(req.body.price<=0){
        return res.status(400).send("Product Price Should be greater than 0");
      }
      if(req.body.stock< 0 || req.body.stock.trim().length === 0 ){
        return res.status(400).send("Stock Should be greater than 0");
      }

      const images = req.files.map(file => file.filename);
      await productHelper.createProduct(req.body,images)
      res.redirect('/admin/productManagement');
    } catch (error) {
      console.log(error)
      next(error)
    }
  }



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
      const deletedImages = req.body.deletedImages ? req.body.deletedImages.split(",") : [];
      const currentProduct = await Product.findById(req.body.id);


       // If there are new images, add the old image names to the deleted images array
        if (images && images.length > 0) {
            images.forEach((img, index) => {
                const oldImageName = currentProduct.images[index];
                if (oldImageName) {
                    deletedImages.push(oldImageName);
                }
            }); 
        }
      await productHelper.updateProduct(req.body, images, deletedImages)
      res.redirect('/admin/productManagement');
    } catch (error) {
      console.log(error.message);
    }
  };

  const productPage = async (req, res, next) => {
    try {
      const usercart = res.locals.user

      const count = await cartHelper.getCartCount(usercart.id)
      const id = req.query.id
      const product = await Product.findOne({ _id : id }).populate('category')
      res.render('public/product',{product : product, count: count })    
    } catch (error) {
      console.log(error);
      next(error)
      // res.send({ success: false, error: error.message });
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