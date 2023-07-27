const Category = require('../models/categoryModel')

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
      console.log(id);
      const category = await Category.findById(id);
      console.log(category);
      res.render('updateCategory', { category: category});
    } catch (error) {
      console.log(error.message)
    }
}

const updateCategory = async (req, res)=>{
    try {
      const categoryId  = req.body.id
      //await categoryHelper.updateCategory(categoryId,req.body)
      res.redirect('/admin/categoryManagement')
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ error: 'Failed to update category' });
    }
  }


module.exports = {
    loadCategory,
    loadAddCategory,
    createCategory,
    loadUpdateCategory,
    updateCategory
}