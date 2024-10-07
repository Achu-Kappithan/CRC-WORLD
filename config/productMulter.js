const multer = require("multer")
const path =  require("path")


const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/admin/assets/uploads/product/'); 
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const uploadProductImages = multer({ 
    storage: productStorage,
    fileFilter: function (req, file, cb) {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Not an image! Please upload an image.'), false);
      }
    }
  });
  
  module.exports = uploadProductImages;
  