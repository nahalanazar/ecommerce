const Category = require('../models/categoryModel')
const categoryHelper = require('../Helper/categoryHelper')
const loadCategory = async(req,res)=>{
    try {
      const categories = await Category.find({});
      res.render('categoryManagement', {categories})
    } catch (error) {
        console.log(error)
    }
}

const loadAddCategory = async(req,res)=>{
    try { 
      res.render('addCategory')
    } catch (error) {
        console.log(error)
    }
}

const createCategory = async(req, res)=>{
    try {
      const existingCategory = await Category.findOne({name:req.body.name})
      if(existingCategory){
        return res.render("addCategory",{message:"Category already exists"})
      } 
      if (!req.body.name || req.body.name.trim().length === 0) {
        return res.render("addCategory", { message: "Name is required" });
    }
       //await categoryHelper.createCategory(req.body)
        const { name, description } = req.body;
        await Category.create({ name, description });
        res.redirect('/admin/categoryManagement')
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ error: 'Failed to create category' });
    }
}

const loadUpdateCategory = async(req,res)=>{
    try {
      const id = req.query.id
      const category = await Category.findById(id);
      res.render('updateCategory', { category: category});
    } catch (error) {
      console.log(error.message)
    }
}

const updateCategory = async (req, res)=>{
    try {
      const categoryId  = req.body.id
      //await categoryHelper.updateCategory(categoryId,req.body)
      await Category.findByIdAndUpdate({_id:categoryId},{$set:{name:req.body.name,description:req.body.description}});
      res.redirect('/admin/categoryManagement')
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ error: 'Failed to update category' });
    }
  }


  // const unListCategory = async(req, res)=>{
  //   try {
  //     await Category.findByIdAndUpdate(req.query.id,{isListed:false});
  //     await Product.updateMany({ category: req.query.id }, {$set:{ isListed: false }})
  //     //await categoryHelper.unListCategory(req.query.id)
  //     res.redirect('/admin/category')
  //   } catch (error) {
  //     res.status(500).json({ error: 'Failed to delete category' });
  //   }
  // }

  // const reListCategory = async(req, res)=>{
  //   try {
  //     await Category.findByIdAndUpdate(req.query.id,{isListed:true});
  //         await Product.updateMany({ category: req.query.id },{$set:{ isListed: true }})
  //     //await categoryHelper.reListCategory(req.query.id)
  //     res.redirect('/admin/category')
  //   } catch (error) {
  //     res.status(500).json({ error: 'Failed to delete category' });
  //   }
  // }

  const unListCategory = async(req, res)=>{
    try {
      await categoryHelper.unListCategory(req.query.id)
      res.redirect('/admin/categoryManagement')
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
  const reListCategory = async(req, res)=>{
    try {
      await categoryHelper.reListCategory(req.query.id)
      res.redirect('/admin/categoryManagement')
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }

module.exports = {
    loadCategory,
    loadAddCategory,
    createCategory,
    loadUpdateCategory,
    updateCategory,
    unListCategory,
    reListCategory
}