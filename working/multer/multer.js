const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './views/admin/product_images/');
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed file types
    const fileTypes = /jpeg|jpg|png/;
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only jpg, jpeg, and png are allowed.'), false);
    }
};

module.exports = {
    upload: multer({ 
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 2 * 1024 * 1024 // setting the limit for each image to 2MB
        }
    }).array("images", 3),  // Here, '3' is the maximum number of images you can upload at a time.
};












// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './views/admin/product_images/');
//     },
//     filename: function (req, file, cb) {
//       const fileName = Date.now() + path.extname(file.originalname);
//       cb(null, fileName);
//     }
//   });
  

//   module.exports = {
//     upload: multer({ storage: storage }).array("images"),
//   }