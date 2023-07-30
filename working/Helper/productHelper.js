const Product = require('../models/productModel')


const createProduct = (data,images) => {
    return new Promise((resolve,reject) =>{
      const newProduct = new Product({
        name:data.name,
        description:data.description,
        images:images,
        category:data.category,
        price:data.price
      });
  
      newProduct.save()
        .then(() =>{ 
            console.log("Product created successfully");
          resolve() 
        })
        .catch((err) => {
          console.error('Error adding product:', err);
          reject(err)
        });
      });
  
  };

  const unListProduct = (query) => {
    return new Promise((resolve, reject) => {
      const id = query;
      Product.updateOne({ _id: id }, { isProductListed: false })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log(error.message);
          reject(error);
        });
    });
  };

  const reListProduct = (query) => {
    return new Promise(async (resolve, reject) => {
      try {
        const id = query;
        const categorylisted = await Product.findOne({ _id: id }).populate('category');
        
        if (categorylisted.category.isListed === true) {
          await Product.updateOne({ _id: id }, { isProductListed: true });
        } else {
          console.log('Cannot Relist');

        }
        
        resolve();
      } catch (error) {
        console.log(error.message);
        reject(error);
      }
    });
  };

  const updateProduct = async (data, images) => {
    try {
        let updateQuery = {
            $set: {
                name: data.name,
                description: data.description,
                category: data.category,
                price: data.price
            }
        };

        // Only add images to the update query if images are not undefined
        // (i.e., new images have been uploaded)
        if(images && images.length > 0) {
            updateQuery.$set.images = images;
        }

        // Update the product in the database
        const productData = await Product.updateOne({ _id: data.id }, updateQuery);

    } catch (error) {
      console.log(error.message);
    }
};

 

  module.exports = {
    createProduct,
    unListProduct,
    reListProduct,
    updateProduct
  }