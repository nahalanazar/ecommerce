const Product = require('../models/productModel')
const fs = require('fs');


const createProduct = (data,images) => {
    return new Promise((resolve,reject) =>{
      const newProduct = new Product({
        name:data.name,
        description:data.description,
        images:images,
        category:data.category,
        price:data.price,
        stock: data.stock
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

  const updateProduct = async (data, images, deletedImages) => {
    try {
        // Fetch the current product data
        const currentProduct = await Product.findById(data.id);

        // If there are new images uploaded
        if(images && images.length > 0) {
            // Append new images to the existing ones or replace them as necessary
            images.forEach((img, index) => {
                if (currentProduct.images[index]) {
                    // If an image already exists at this position, replace it
                    currentProduct.images[index] = img;
                } else {
                    // If not, simply add the new image to the end
                    currentProduct.images.push(img);
                }
            });
      } 

      if (deletedImages && deletedImages.length > 0) {
    deletedImages.forEach(imgName => {
        console.log("Attempting to delete:", imgName);
        const imagePath = `./views/admin/product_images/${imgName}`;
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, err => {
                if (err) {
                    console.error("Error deleting image: ", err.message);
                } else {
                    console.log("Successfully deleted image:", imgName);
                }
            });
        } else {
            console.error("Image not found on server:", imgName);
        }
        
        // Remove from currentProduct.images if it's still there
        const imgIndex = currentProduct.images.indexOf(imgName);
        if (imgIndex !== -1) {
            currentProduct.images.splice(imgIndex, 1);
        }
    });
}

        let updateQuery = {
            $set: {
                name: data.name,
                description: data.description,
                category: data.category,
                price: data.price,
                stock: data.stock,
                images: currentProduct.images // Set images to the updated array
            }
        };
        console.log("updated:", images);
        // Update the product in the database
        await Product.updateOne({ _id: data.id }, updateQuery);

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